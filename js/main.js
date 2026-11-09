// Эти данные нужны для страницы товара, модального окна и расчёта заявки.
const products = {
  lamp: {
    name: 'Лампа «Линия»', price: 1490, badge: 'Хит', color: 'primary',
    description: 'Для вечерней учёбы, чтения и работы за столом.',
    material: 'Металл', shade: 'Жёлтый и зелёный', size: 'Высота 38 см',
    care: 'Перед уборкой отключите лампу от сети, затем протрите её сухой мягкой тканью.'
  },
  organizer: {
    name: 'Органайзер «Порядок»', price: 890, badge: 'Новинка', color: 'success',
    description: 'Ручки, карандаши и мелочи больше не теряются на столе.',
    material: 'Пластик', shade: 'Зелёный', size: '24 × 12 × 14 см',
    care: 'Протрите влажной тканью и вытрите насухо — этого достаточно.'
  },
  notebook: {
    name: 'Блокнот «Точка опоры»', price: 320, badge: 'Скидка', color: 'danger',
    description: 'Записывайте идеи, стройте планы и делайте заметки на парах.',
    material: 'Бумага, картон', shade: 'Розовый', size: 'А5, 80 листов',
    care: 'Берегите от воды и не сгибайте обложку, чтобы страницы дольше оставались аккуратными.'
  }
};

function money(value) {
  return value.toLocaleString('ru-RU') + ' ₽';
}

// Параметр в ссылке передаёт выбранный товар между страницами.
const productCode = new URLSearchParams(window.location.search).get('product');
const selectedProduct = Object.keys(products).includes(productCode) ? productCode : 'lamp';

if (document.getElementById('product-title')) {
  const product = products[selectedProduct];
  document.title = product.name + ' — Магазин';
  document.getElementById('product-title').textContent = product.name;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('product-price').textContent = money(product.price);
  document.getElementById('product-image').src = 'images/' + selectedProduct + '.svg';
  document.getElementById('product-image').alt = product.name;
  document.getElementById('product-badge').textContent = product.badge;
  document.getElementById('product-badge').className = 'badge text-bg-' + product.color + ' mb-2';
  document.getElementById('product-material').textContent = product.material;
  document.getElementById('product-color').textContent = product.shade;
  document.getElementById('product-size').textContent = product.size;
  document.getElementById('product-care').textContent = product.care;
  document.getElementById('product-order').dataset.product = selectedProduct;
}

const orderModal = document.getElementById('order-modal');
orderModal.addEventListener('show.bs.modal', function (event) {
  const code = event.relatedTarget.dataset.product;
  document.getElementById('modal-product').textContent = products[code].name;
  document.getElementById('modal-price').textContent = money(products[code].price);
  document.getElementById('modal-order-link').href = 'order.html?product=' + code;
});

const filterForm = document.getElementById('filter-form');
if (filterForm) {
  const grid = document.getElementById('catalog-products');
  const cards = Array.from(grid.children);

  function filterProducts() {
    const search = document.getElementById('search').value.trim().toLowerCase();
    const category = document.getElementById('category').value;
    const maxPrice = document.getElementById('max-price').value;
    const sort = document.getElementById('sort').value;
    let count = 0;

    // Сначала меняем порядок, затем скрываем неподходящие карточки.
    const sortedCards = cards.slice();
    if (sort === 'cheap') sortedCards.sort((a, b) => a.dataset.price - b.dataset.price);
    if (sort === 'expensive') sortedCards.sort((a, b) => b.dataset.price - a.dataset.price);

    sortedCards.forEach(function (card) {
      const name = card.querySelector('.card-title').textContent.toLowerCase();
      const matches = name.includes(search) &&
        (category === 'all' || card.dataset.category === category) &&
        (maxPrice === '' || Number(card.dataset.price) <= Number(maxPrice));
      card.hidden = !matches;
      if (matches) count++;
      grid.appendChild(card);
    });
    document.getElementById('results-count').textContent = 'Найдено товаров: ' + count;
    document.getElementById('empty-results').classList.toggle('d-none', count !== 0);
  }

  filterForm.addEventListener('submit', function (event) {
    event.preventDefault();
    filterProducts();
  });
  filterForm.addEventListener('input', filterProducts);
  filterForm.addEventListener('change', filterProducts);
  filterForm.addEventListener('reset', function () {
    // Событие reset срабатывает до сброса значений полей.
    setTimeout(filterProducts, 0);
  });
}

const orderForm = document.getElementById('order-form');
if (orderForm) {
  const productSelect = document.getElementById('order-product');
  const quantity = document.getElementById('quantity');
  const delivery = document.getElementById('delivery');
  const success = document.getElementById('order-success');
  const nameInput = document.getElementById('name');

  // Без параметра в URL пользователь сам выбирает товар.
  if (Object.keys(products).includes(productCode)) productSelect.value = productCode;

  function updateSummary() {
    const product = products[productSelect.value];
    const count = Number(quantity.value);
    const validCount = Number.isInteger(count) && count >= 1 && count <= 10;
    const subtotal = product && validCount ? product.price * count : 0;
    const deliveryPrice = product && validCount && delivery.value === 'delivery' ? 300 : 0;
    document.getElementById('summary-product').textContent = product ? product.name : 'Выберите товар — здесь появится сумма.';
    document.getElementById('summary-subtotal').textContent = money(subtotal);
    document.getElementById('summary-delivery').textContent = money(deliveryPrice);
    document.getElementById('summary-total').textContent = money(subtotal + deliveryPrice);
  }

  nameInput.addEventListener('input', function () {
    nameInput.setCustomValidity(nameInput.value.trim().length < 2 ? 'Подскажите, как к вам обращаться: нужно хотя бы два символа.' : '');
  });
  orderForm.addEventListener('input', function () {
    success.classList.add('d-none');
    updateSummary();
  });
  orderForm.addEventListener('change', updateSummary);
  orderForm.addEventListener('reset', function () {
    nameInput.setCustomValidity('');
    success.classList.add('d-none');
    setTimeout(updateSummary, 0);
  });
  orderForm.addEventListener('submit', function (event) {
    event.preventDefault();
    success.textContent = 'Всё заполнено! Вы выбрали: ' + products[productSelect.value].name +
      ', количество: ' + quantity.value + '. Итого: ' + document.getElementById('summary-total').textContent +
      '. Проверьте выбор — если нужно, данные ещё можно изменить.';
    success.classList.remove('d-none');
    success.focus();
  });
  updateSummary();
}
