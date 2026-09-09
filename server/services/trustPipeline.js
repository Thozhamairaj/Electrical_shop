const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

const SERVER_ROOT = path.join(__dirname, '..');
const VENV_PYTHON = path.join(
    SERVER_ROOT,
    '.venv',
    process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'
);
const PYTHON_BIN = process.env.PYTHON_BIN || (fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : 'python3');
const RAG_DIR = path.join(SERVER_ROOT, 'rag');
const AI_DIR = path.join(SERVER_ROOT, 'ai_models');

// Load both server/.env and project-root .env so GEMINI_API_KEY is available.
dotenv.config({ path: path.join(SERVER_ROOT, '.env') });
dotenv.config({ path: path.join(SERVER_ROOT, '..', '.env') });

function runPython(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
        const child = spawn(PYTHON_BIN, [scriptPath, ...args], {
            cwd: SERVER_ROOT,
            env: {
                ...process.env,
            },
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
        });

        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });

        child.on('error', (error) => reject(error));
        child.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python exited with ${code}. ${stderr || stdout}`));
            }
            resolve(stdout.trim());
        });
    });
}

function parseJsonOutput(raw) {
    const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i -= 1) {
        try {
            return JSON.parse(lines[i]);
        } catch (err) {
            // keep scanning previous lines
        }
    }
    throw new Error(`Could not parse JSON output: ${raw}`);
}

async function ensureProductIndex() {
    const script = path.join(RAG_DIR, 'index_products.py');
    const raw = await runPython(script, []);
    return parseJsonOutput(raw);
}

async function retrieveProduct(productId, reviewText = '') {
    const script = path.join(RAG_DIR, 'retrieve_product.py');
    const raw = await runPython(script, [String(productId), reviewText || '']);
    return parseJsonOutput(raw);
}

async function predictTrust({ rating, reviewTitle, reviewText, productPayload }) {
    const script = path.join(AI_DIR, 'predict_trust.py');
    const payload = JSON.stringify({
        rating,
        reviewTitle,
        reviewText,
        productPayload,
    });

    const raw = await runPython(script, [payload]);
    return parseJsonOutput(raw);
}

async function runTrustInference({ productId, rating, reviewTitle, reviewText }) {
    let indexResult = null;
    let productPayload = null;

    try {
        indexResult = await ensureProductIndex();
        productPayload = await retrieveProduct(productId, reviewText);

        if (productPayload && productPayload.error) {
            const error = new Error(productPayload.error);
            error.statusCode = 404;
            throw error;
        }
    } catch (err) {
        // RAG unavailable (missing chromadb/sentence-transformers) or index error.
        // Fall back to a lightweight local product lookup from server/products.json
        try {
            const productsPath = path.join(SERVER_ROOT, 'products.json');
            const raw = fs.readFileSync(productsPath, 'utf8');
            const products = JSON.parse(raw);
            const prod = products.find((p) => Number(p.id) === Number(productId));
            if (!prod) {
                const error = new Error('Product not found');
                error.statusCode = 404;
                throw error;
            }

            productPayload = {
                product: {
                    id: prod.id,
                    name: prod.name,
                    category: prod.category,
                    description: prod.description || '',
                    specs: prod.specs || {},
                    rating: prod.rating || null,
                    reviews: prod.reviews || 0,
                },
                fallback: true,
            };
        } catch (readErr) {
            const error = new Error(
                `RAG unavailable and fallback product lookup failed: ${readErr.message}`
            );
            error.statusCode = 500;
            throw error;
        }
    }

    const prediction = await predictTrust({
        rating,
        reviewTitle,
        reviewText,
        productPayload: productPayload.product,
    });

    return {
        indexResult,
        productPayload,
        prediction,
    };
}

module.exports = {
    ensureProductIndex,
    retrieveProduct,
    predictTrust,
    runTrustInference,
};
