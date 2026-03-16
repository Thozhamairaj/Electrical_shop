export const SHOP_PHONE = "+919080858198"; // Updated from user provided data

/**
 * Generates a WhatsApp URL with a pre-filled message.
 * @param {string} message - The message to pre-fill.
 * @param {string} phone - The phone number to send the message to.
 * @returns {string} The WhatsApp URL.
 */
export const generateWhatsAppUrl = (message, phone = SHOP_PHONE) => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone.replace(/[^\d+]/g, '')}?text=${encodedMessage}`;
};

/**
 * Formats a message for ordering a single product.
 * @param {object} product - The product object.
 * @param {number} quantity - The quantity to order.
 * @returns {string} The formatted message.
 */
export const formatProductOrderMessage = (product, quantity, userPhone = '') => {
    return `Hello, I'd like to order:
*Product:* ${product.name}
*Quantity:* ${quantity}
*Price:* ₹${product.price.toFixed(2)}
*Total:* ₹${(product.price * quantity).toFixed(2)}
${userPhone ? `*Customer Phone:* ${userPhone}` : ''}

Please let me know about availability and payment options.`;
};

/**
 * Formats a message for a product enquiry.
 * @param {object} product - The product object.
 * @returns {string} The formatted message.
 */
export const formatProductEnquiryMessage = (product) => {
    return `Hello, I have an enquiry regarding:
*Product:* ${product.name} (Code: ${product.id})
*Link:* ${window.location.origin}/product/${product.id}

I'd like to know more about this product.`;
};

/**
 * Formats a message for a cart order.
 * @param {array} cartItems - The items in the cart.
 * @param {number} total - The total amount.
 * @returns {string} The formatted message.
 */
export const formatCartOrderMessage = (cartItems, total, userPhone = '') => {
    let itemList = "";
    cartItems.forEach((item, index) => {
        itemList += `${index + 1}. *${item.name}* (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });

    return `Hello, I'd like to place an order for the following items:

${itemList}
*Subtotal:* ₹${total.toFixed(2)}
*Shipping:* ${total >= 500 ? 'FREE' : '₹50.00'}
*Grand Total:* ₹${(total >= 500 ? total : total + 50).toFixed(2)}
${userPhone ? `\n*Customer Phone:* ${userPhone}` : ''}

Please confirm my order.`;
};
