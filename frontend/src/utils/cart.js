export function getCart() {
    let cartInString = localStorage.getItem("cart");
    if(cartInString == null) {
        cartInString = "[]";
        localStorage.setItem("cart", cartInString);
    }
    const cart = JSON.parse(cartInString);
    return cart;
}

export function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingItemIndex = cart.findIndex((item) => {
        return item.productId === product._id;
    });
    
    if(existingItemIndex !== -1) {
        // Item already exists in cart, update quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // New item, add to cart
        cart.push({
            productId: product._id,
            price: product.pricePerDay || product.price,
            name: product.bikeName || product.name,
            image: product.images?.[0] || product.image,
            quantity: quantity,
            bikeType: product.bikeType,
            city: product.city
        });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    // Dispatch custom event to notify components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
    return cart;
}

export function removeFromCart(productId) {
    const cart = getCart();
    const filteredCart = cart.filter((item) => item.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(filteredCart));
    // Dispatch custom event to notify components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
    return filteredCart;
}

export function updateCartQuantity(productId, newQuantity) {
    const cart = getCart();
    const itemIndex = cart.findIndex((item) => item.productId === productId);
    
    if(itemIndex !== -1) {
        if(newQuantity <= 0) {
            return removeFromCart(productId);
        } else {
            cart[itemIndex].quantity = newQuantity;
            localStorage.setItem("cart", JSON.stringify(cart));
            // Dispatch custom event to notify components about cart update
            window.dispatchEvent(new Event('cartUpdated'));
            return cart;
        }
    }
    return cart;
}

export function clearCart() {
    localStorage.setItem("cart", "[]");
    // Dispatch custom event to notify components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
    return [];
}

export function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

export function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
}
