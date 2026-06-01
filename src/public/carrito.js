const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const clearCartButton = document.getElementById('clear-cart');
const paymentForm = document.getElementById('payment-form');
const checkoutButton = document.getElementById('checkout-btn');

const cardNameInput = document.getElementById('cardName');
const cardNumberInput = document.getElementById('cardNumber');
const cardExpiryInput = document.getElementById('cardExpiry');
const cardCvvInput = document.getElementById('cardCvv');

function getCart() {
  try {
    const raw = localStorage.getItem('cart');
    const cart = raw ? JSON.parse(raw) : [];
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function formatMoney(value) {
  const number = Number(value) || 0;
  return number.toFixed(2);
}

function calcularTotal(cart) {
  return cart.reduce((acc, item) => {
    const precio = Number(item.precio) || 0;
    const cantidad = Number(item.cantidad) || 0;
    return acc + precio * cantidad;
  }, 0);
}

function renderCart() {
  const cart = getCart();

  if (!cart.length) {
    cartItemsContainer.textContent = 'Tu carrito está vacío.';
    cartTotal.textContent = formatMoney(0);
    return;
  }

  const itemsHtml = cart.map((item) => `
    <article>
      <h3>${item.nombre}</h3>
      <p><strong>Precio:</strong> ${formatMoney(item.precio)}</p>
      <p><strong>Cantidad:</strong> ${item.cantidad}</p>
      <button type="button" class="remove-item" data-product-id="${item.productId}">Quitar</button>
    </article>
  `).join('<hr>');

  cartItemsContainer.innerHTML = itemsHtml;
  cartTotal.textContent = formatMoney(calcularTotal(cart));
}

function validarPago() {
  const cardName = cardNameInput.value.trim();
  const cardNumber = cardNumberInput.value.trim();
  const cardExpiry = cardExpiryInput.value.trim();
  const cardCvv = cardCvvInput.value.trim();

  const completo = Boolean(cardName && cardNumber && cardExpiry && cardCvv);
  checkoutButton.hidden = !completo;
}

cartItemsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('button.remove-item');
  if (!button) return;

  const productId = button.dataset.productId;
  const cart = getCart().filter((item) => String(item.productId) !== String(productId));
  saveCart(cart);
  renderCart();
});

clearCartButton.addEventListener('click', () => {
  saveCart([]);
  renderCart();
});

[cardNameInput, cardNumberInput, cardExpiryInput, cardCvvInput].forEach((input) => {
  input.addEventListener('input', validarPago);
});

paymentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const cart = getCart();
  if (!cart.length) {
    alert('Tu carrito está vacío.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Primero inicia sesión para poder comprar.');
    window.location.href = '/login.html';
    return;
  }

  const payload = {
    items: cart.map((item) => ({
      productId: item.productId,
      quantity: item.cantidad
    })),
    payment: {
      method: 'tarjeta',
      cardName: cardNameInput.value.trim(),
      cardNumber: cardNumberInput.value.trim(),
      cardExpiry: cardExpiryInput.value.trim(),
      cardCvv: cardCvvInput.value.trim()
    }
  };

  try {
    const response = await fetch('/api/orders/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || 'No se pudo procesar la compra');
      return;
    }

    saveCart([]);
    renderCart();
    validarPago();

    alert(result.message || 'Compra registrada');
  } catch (error) {
    alert('Error al procesar la compra');
  }
});

renderCart();
validarPago();
