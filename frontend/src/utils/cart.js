export function getCart() {
    let cartInString = localStorage.getItem("cart");
    if(cartInString == null) {
        cartInString = "[]";
        localStorage.setItem("cart", cartInString);
    }
    const cart = JSON.parse(cartInString);
    return cart;
}

export function addToCart(product, rentalDays = 1) {
    const cart = getCart();
    const existingItemIndex = cart.findIndex((item) => {
        return item.productId === product._id;
    });
    
    if(existingItemIndex !== -1) {
        // Item already exists in cart - for bike rentals, don't allow duplicates
        return { success: false, message: "This bike is already in your cart" };
    } else {
        // New item, add to cart
        cart.push({
            productId: product._id,
            price: product.pricePerDay || product.price,
            name: product.bikeName || product.name,
            image: product.images?.[0] || product.image,
            rentalDays: rentalDays, // Store rental days instead of quantity
            bikeType: product.bikeType,
            city: product.city
        });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    // Dispatch custom event to notify components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
    return { success: true, message: "Bike added to cart", cart: cart };
}

export function removeFromCart(productId) {
    const cart = getCart();
    const filteredCart = cart.filter((item) => item.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(filteredCart));
    // Dispatch custom event to notify components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
    return filteredCart;
}

export function updateCartRentalDays(productId, newRentalDays) {
    const cart = getCart();
    const itemIndex = cart.findIndex((item) => item.productId === productId);
    
    if(itemIndex !== -1) {
        if(newRentalDays <= 0) {
            return removeFromCart(productId);
        } else {
            cart[itemIndex].rentalDays = newRentalDays;
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
        return total + (item.price * (item.rentalDays || 1));
    }, 0);
}

export function getCartItemCount() {
    const cart = getCart();
    return cart.length; // Count number of bikes, not rental days
}

export function getRentalDaysInCart(productId) {
    const cart = getCart();
    const item = cart.find(item => item.productId === productId);
    return item ? item.rentalDays : 0;
}

export function isProductInCart(productId) {
    const cart = getCart();
    return cart.some(item => item.productId === productId);
}
