// Socket.io connection
const socket = io();

// Handle real-time product updates
socket.on('productosActualizados', (productos) => {
    // If we're on the products page, reload to show updated products
    if (window.location.pathname === '/products') {
        window.location.reload();
    }
});

// Add to cart function
function addToCart(productId) {
    fetch('/api/carts/1/products/' + productId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: 1 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Producto agregado al carrito');
        } else {
            alert('Error al agregar el producto');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al agregar el producto');
    });
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount);
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}); 