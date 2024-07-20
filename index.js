document.addEventListener('DOMContentLoaded', () => {
  let stockList = document.getElementById('stock-list');
  let filterButton = document.getElementById('filter-damaged');
  let addStockForm = document.getElementById('add-stock-form');
  let loginForm = document.getElementById('login-form');
  let createAccountButton = document.getElementById('create-account');
  let controlsSection = document.querySelector('.controls');
  let stockListSection = document.querySelector('.stock-list');
  let modal = document.getElementById('modal');

  let loggedIn = false;
  let users = [];
  
  let fetchStockData = async () => {
      try {
          let response = await fetch('http://localhost:3000/stock');
          let stockData = await response.json();
          displayStock(stockData);
      } catch (error) {
          console.error('Error fetching stock data:', error);
      }
  };

  let displayStock = (stockData) => {
      stockList.innerHTML = '';
      stockData.forEach(stockItem => {
          let listItem = document.createElement('li');
          listItem.className = stockItem.status === 'damaged' ? 'damaged' : '';
          listItem.innerHTML = `
              <div>${stockItem.product}</div>
              <div>${stockItem.quantity}</div>
              <div>${stockItem.status}</div>
              <button class="edit-button" data-id="${stockItem.id}">Edit</button>
              <button class="delete-button" data-id="${stockItem.id}">Delete</button>
          `;
          stockList.appendChild(listItem);
      });

      document.querySelectorAll('.edit-button').forEach(button => {
          button.addEventListener('click', (event) => {
              let id = event.target.getAttribute('data-id');
              editStock(id);
          });
      });

      document.querySelectorAll('.delete-button').forEach(button => {
          button.addEventListener('click', (event) => {
              let id = event.target.getAttribute('data-id');
              deleteStock(id);
          });
      });
  };

  let deleteStock = async (id) => {
      try {
          await fetch(`http://localhost:3000/stock/${id}`, { method: 'DELETE' });
          fetchStockData();
      } catch (error) {
          console.error('Error deleting stock item:', error);
      }
  };

  let editStock = async (id) => {
      try {
          let response = await fetch(`http://localhost:3000/stock/${id}`);
          let stockItem = await response.json();
          modal.classList.add('active');
          modal.innerHTML = `
              <form id="edit-stock-form">
                  <input type="text" id="edit-product" value="${stockItem.product}" required>
                  <input type="number" id="edit-quantity" value="${stockItem.quantity}" required>
                  <select id="edit-status" required>
                      <option value="in stock" ${stockItem.status === 'in stock' ? 'selected' : ''}>In Stock</option>
                      <option value="out of stock" ${stockItem.status === 'out of stock' ? 'selected' : ''}>Out of Stock</option>
                      <option value="damaged" ${stockItem.status === 'damaged' ? 'selected' : ''}>Damaged</option>
                  </select>
                  <button type="submit">Save</button>
                  <button type="button" id="close-modal">Close</button>
              </form>
          `;

          let editStockForm = document.getElementById('edit-stock-form');
          let closeModalButton = document.getElementById('close-modal');

          editStockForm.addEventListener('submit', async (event) => {
              event.preventDefault();
              let updatedStockItem = {
                  product: document.getElementById('edit-product').value,
                  quantity: Number(document.getElementById('edit-quantity').value),
                  status: document.getElementById('edit-status').value
              };

              try {
                  await fetch(`http://localhost:3000/stock/${id}`, {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(updatedStockItem)
                  });
                  modal.classList.remove('active');
                  fetchStockData();
              } catch (error) {
                  console.error('Error updating stock item:', error);
              }
          });

          closeModalButton.addEventListener('click', () => {
              modal.classList.remove('active');
          });
      } catch (error) {
          console.error('Error fetching stock item:', error);
      }
  };

  filterButton.addEventListener('click', () => {
      let items = document.querySelectorAll('#stock-list li');
      items.forEach(item => {
          if (!item.classList.contains('damaged')) {
              item.style.display = 'none';
          } else {
              item.style.display = '';
          }
      });
  });

  addStockForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      let product = document.getElementById('product').value;
      let quantity = document.getElementById('quantity').value;
      let status = document.getElementById('status').value;

      let newStockItem = {
          product: product,
          quantity: Number(quantity),
          status: status
      };

      try {
          await fetch('http://localhost:3000/stock', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(newStockItem)
          });
          fetchStockData();
      } catch (error) {
          console.error('Error adding stock item:', error);
      }

      addStockForm.reset();
  });

  loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      let username = document.getElementById('username').value;
      let password = document.getElementById('password').value;

      let user = users.find(user => user.username === username && user.password === password);
      if (user) {
          loggedIn = true;
          loginForm.style.display = 'none';
          controlsSection.style.display = 'block';
          stockListSection.style.display = 'block';
          fetchStockData();
      } else {
          alert('Invalid login credentials');
      }
  });

  createAccountButton.addEventListener('click', () => {
      modal.classList.add('active');
      modal.innerHTML = `
          <form id="create-account-form">
              <input type="text" id="new-username" placeholder="New Username" required>
              <input type="password" id="new-password" placeholder="New Password" required>
              <button type="submit">Create Account</button>
              <button type="button" id="close-modal">Close</button>
          </form>
      `;

      let createAccountForm = document.getElementById('create-account-form');
      let closeModalButton = document.getElementById('close-modal');

      createAccountForm.addEventListener('submit', (event) => {
          event.preventDefault();
          let newUsername = document.getElementById('new-username').value;
          let newPassword = document.getElementById('new-password').value;

          users.push({ username: newUsername, password: newPassword });
          alert('Account created successfully');
          modal.classList.remove('active');
      });

      closeModalButton.addEventListener('click', () => {
          modal.classList.remove('active');
      });
  });
});
