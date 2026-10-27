// Configuration API
const API_BASE_URL = "http://localhost:3200/api";
const USER_ID = "user_" + Date.now(); // Génère un ID utilisateur unique

// ==================== PRODUITS ====================

// Récupérer tous les produits
async function getProducts(category = "all", search = "", sort = "recent") {
  try {
    const params = new URLSearchParams();
    if (category !== "all") params.append("category", category);
    if (search) params.append("search", search);
    if (sort) params.append("sort", sort);

    const response = await fetch(`${API_BASE_URL}/products?${params}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      console.error("Erreur:", data.error);
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
  }
}

// Récupérer un produit
async function getProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Créer un produit (admin)
async function createProduct(productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    const data = await response.json();

    if (data.success) {
      console.log("Produit créé:", data.data);
      return data.data;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// ==================== PANIER ====================

// Récupérer le panier
async function getCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/cart?userId=${USER_ID}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Ajouter au panier
async function addToCart(productId, name, price, svg, quantity = 1) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        productId,
        name,
        price,
        svg,
        quantity,
      }),
    });
    const data = await response.json();

    if (data.success) {
      console.log("✅", data.message);
      return data.data;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Mettre à jour la quantité
async function updateCartQuantity(productId, quantity) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/update/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        quantity,
      }),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Supprimer du panier
async function removeFromCart(productId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cart/remove/${productId}?userId=${USER_ID}`,
      {
        method: "DELETE",
      },
    );
    const data = await response.json();

    if (data.success) {
      console.log("✅", data.message);
      return data.data;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Vider le panier
async function clearCart() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cart/clear?userId=${USER_ID}`,
      {
        method: "DELETE",
      },
    );
    const data = await response.json();

    if (data.success) {
      console.log("✅", data.message);
      return data.data;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// ==================== COMMANDES ====================

// Récupérer mes commandes
async function getMyOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?userId=${USER_ID}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Récupérer une commande
async function getOrder(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Créer une commande
async function createOrder(items, customerInfo) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        items,
        ...customerInfo,
      }),
    });
    const data = await response.json();

    if (data.success) {
      console.log("✅ Commande créée:", data.data.id);
      return data.data;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// ==================== EXEMPLES D'UTILISATION ====================

/*
// 1. Récupérer les produits
const products = await getProducts();
console.log('Produits:', products);

// 2. Filtrer par catégorie
const motos = await getProducts('Moto');
console.log('Motos:', motos);

// 3. Ajouter au panier
await addToCart(1, 'Neo', 11000000, 'scooter', 1);

// 4. Voir le panier
const cart = await getCart();
console.log('Panier:', cart);

// 5. Mettre à jour la quantité
await updateCartQuantity(1, 2);

// 6. Créer une commande
const order = await createOrder(
    [{ productId: 1, name: 'Neo', price: 11000000, quantity: 1 }],
    {
        customerName: 'Jean Dupont',
        customerEmail: 'jean@example.com',
        customerPhone: '+224 612 345 678',
        shippingAddress: 'Conakry, Guinée'
    }
);

// 7. Voir mes commandes
const myOrders = await getMyOrders();
console.log('Mes commandes:', myOrders);

// 8. Voir une commande
const order = await getOrder(1000);
console.log('Commande:', order);
*/

// ==================== INTÉGRATION AVEC LE HTML ====================

// Utilisation dans une page HTML
document.addEventListener("DOMContentLoaded", async () => {
  // Récupérer et afficher les produits
  const products = await getProducts();
  const grid = document.getElementById("productsGrid");

  if (grid && products) {
    grid.innerHTML = products
      .map(
        (p) => `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p>${(p.price / 1000000).toFixed(1)} M GNF</p>
                <button onclick="addToCart(${p.id}, '${p.name}', ${p.price}, '${p.svg}', 1)">
                    Ajouter au panier
                </button>
            </div>
        `,
      )
      .join("");
  }
});

// Bouton pour voir le panier
async function viewCart() {
  const cart = await getCart();
  console.log("Votre panier:", cart);
  alert(
    `Panier: ${cart.itemCount} articles\nTotal: ${(cart.total / 1000000).toFixed(1)} M GNF`,
  );
}

// Bouton pour passer une commande
async function checkout() {
  const cart = await getCart();

  if (cart.items.length === 0) {
    alert("Votre panier est vide");
    return;
  }

  const customerName = prompt("Votre nom:");
  const customerEmail = prompt("Votre email:");
  const customerPhone = prompt("Votre téléphone:");
  const shippingAddress = prompt("Adresse de livraison:");

  if (customerName && customerEmail) {
    const order = await createOrder(cart.items, {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
    });

    if (order) {
      alert(`Commande créée! Numéro: ${order.id}`);
      await clearCart();
    }
  }
}
