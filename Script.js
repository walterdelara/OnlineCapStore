// Disable right-click context menu
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
  return false;
});

// Disable keyboard shortcuts for developer tools and other common shortcuts
document.addEventListener("keydown", function (e) {
  // Disable F12 (Developer Tools)
  if (e.key === "F12") {
    e.preventDefault();
    return false;
  }
  // Disable Ctrl+Shift+I (Developer Tools)
  if (e.ctrlKey && e.shiftKey && e.key === "I") {
    e.preventDefault();
    return false;
  }
  // Disable Ctrl+Shift+J (Console)
  if (e.ctrlKey && e.shiftKey && e.key === "J") {
    e.preventDefault();
    return false;
  }
  // Disable Ctrl+U (View Source)
  if (e.ctrlKey && e.key === "u") {
    e.preventDefault();
    return false;
  }
  // Disable Ctrl+S (Save)
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    return false;
  }
});

const app = (() => {
  // --- Formatting Helper ---
  const formatPrice = (price) => {
    return `₱${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  // --- State ---
  const products = [
    {
      id: 1,
      name: "Canvas Cap",
      category: "Caps",
      price: 1499.0,
      colors: ["Onyx", "Bone", "Navy"],
      images: {
        Onyx: "Images/CanvasCapOnyx.webp",
        Bone: "Images/CanvasCapBone.webp",
        Navy: "Images/CanvasCapNavy.webp",
      },
      desc: "Heavy-duty cotton canvas. Unstructured crown and an adjustable fabric strap.",
    },
    {
      id: 2,
      name: "Ribbed Beanie",
      category: "Beanies",
      price: 1249.0,
      colors: ["Heather", "Charcoal"],
      images: {
        Heather: "Images/RibbedBeanieHeather.webp",
        Charcoal: "Images/RibbedBeanieCharcoal.webp",
      },
      desc: "Balances warmth and breathability. Woven from a premium wool blend.",
    },
    {
      id: 3,
      name: "90s Snapback",
      category: "Caps",
      price: 1749.0,
      colors: ["Crimson", "Royal"],
      images: {
        Crimson: "Images/SnapbackCrimson.webp",
        Royal: "Images/SnapbackRoyal.webp",
      },
      desc: "Structured front panels, flat brim, and a classic plastic snap closure.",
    },
    {
      id: 4,
      name: "Utility Bucket",
      category: "Buckets",
      price: 1400.0,
      colors: ["Olive", "Khaki"],
      images: {
        Olive: "Images/UtilityBucketOlive.webp",
        Khaki: "Images/UtilityBucketKhaki.webp",
      },
      desc: "Built for the outdoors. Features a downward sloping brim and tonal stitching.",
    },
    {
      id: 5,
      name: "Vintage Dad Hat",
      category: "Caps",
      price: 1300.0,
      colors: ["Faded Black", "Mustard"],
      images: {
        "Faded Black": "Images/DadHatFadedBlack.webp",
        Mustard: "Images/DadHatMustard.webp",
      },
      desc: "Pre-washed for that perfect vintage feel. Low profile and curved brim.",
    },
    {
      id: 6,
      name: "Running Cap",
      category: "Caps",
      price: 1600.0,
      colors: ["White", "Neon"],
      images: {
        White: "Images/RunningCapWhite.webp",
        Neon: "Images/RunningCapNeon.webp",
      },
      desc: "Ultra-lightweight and breathable. Perfect for high-intensity activities.",
    },
  ];

  let cart = JSON.parse(localStorage.getItem("dropout_cart")) || [];
  cart = cart.map((item) => ({ ...item, selected: item.selected !== false }));

  let wishlist = JSON.parse(localStorage.getItem("dropout_wishlist")) || [];
  let recent = JSON.parse(localStorage.getItem("dropout_recent")) || [];

  let currentActiveProduct = null;
  let currentSelectedColor = null;
  let currentModalQty = 1;
  let currentCategory = "All Drops";

  // User & Auth State
  let currentUser = JSON.parse(localStorage.getItem("dropout_user")) || null;
  let users = JSON.parse(localStorage.getItem("dropout_users")) || [];

  // --- DOM Elements ---
  const els = {
    splash: document.getElementById("splash-screen"),
    appWrapper: document.getElementById("app"),
    mainHeader: document.getElementById("main-header"),
    profileHeader: document.getElementById("profile-header"),
    views: {
      home: document.getElementById("view-home"),
      discover: document.getElementById("view-discover"),
      auth: document.getElementById("view-auth"),
      login: document.getElementById("view-login"),
      register: document.getElementById("view-register"),
      profileDashboard: document.getElementById("view-profile-dashboard"),
      settings: document.getElementById("view-settings"),
      settingsAccount: document.getElementById("view-settings-account"),
      settingsAddress: document.getElementById("view-settings-address"),
      settingsCurrency: document.getElementById("view-settings-currency"),
      settingsLanguage: document.getElementById("view-settings-language"),
      wishlist: document.getElementById("view-wishlist"),
      recent: document.getElementById("view-recent"),
      checkout: document.getElementById("view-checkout"),
      confirmation: document.getElementById("view-confirmation"),
    },
    grid: document.getElementById("product-grid"),
    cartBadges: document.querySelectorAll(".cart-badge"),
    cartDrawer: document.getElementById("cart-drawer"),
    cartOverlay: document.getElementById("cart-overlay"),
    cartItemsList: document.getElementById("cart-items"),
    cartFooter: document.getElementById("cart-footer"),
    cartEmpty: document.getElementById("cart-empty"),
    cartSubtotal: document.getElementById("cart-subtotal"),
    cartSelectedCount: document.getElementById("cart-selected-count"),
    checkoutItems: document.getElementById("checkout-items"),
    checkoutTotal: document.getElementById("checkout-total"),
    navItems: document.querySelectorAll(".nav-item"),
    categoryBtns: document.querySelectorAll(".category-btn"),
    searchOverlay: document.getElementById("search-overlay"),
    searchInput: document.getElementById("search-input"),
    searchResults: document.getElementById("search-results"),
    searchEmpty: document.getElementById("search-empty"),
    wishlistGrid: document.getElementById("wishlist-grid"),
    recentGrid: document.getElementById("recent-grid"),
    modal: {
      wrap: document.getElementById("product-modal"),
      bg: document.getElementById("modal-bg"),
      content: document.getElementById("modal-content"),
      img: document.getElementById("modal-img"),
      title: document.getElementById("modal-title"),
      price: document.getElementById("modal-price"),
      desc: document.getElementById("modal-desc"),
      colors: document.getElementById("modal-colors"),
      colorLabel: document.getElementById("color-label"),
      qty: document.getElementById("modal-qty"),
      addBtn: document.getElementById("modal-add-btn"),
    },
  };

  // --- Initialization ---
  const init = () => {
    renderProducts();
    updateCartUI();
    updateProfileUI();

    // Simulate App Load
    setTimeout(() => {
      els.splash.style.opacity = "0";
      setTimeout(() => {
        els.splash.style.display = "none";
        els.appWrapper.classList.remove("hidden");
        setTimeout(() => {
          els.appWrapper.style.opacity = "1";
        }, 50);
      }, 700);
    }, 1200);
  };

  // --- Navigation Logic ---
  const navigate = (viewName) => {
    if (viewName === "profile") {
      viewName = currentUser ? "profileDashboard" : "auth";
    }

    const customHeaderViews = [
      "settings",
      "settingsAccount",
      "settingsAddress",
      "settingsCurrency",
      "settingsLanguage",
      "wishlist",
      "recent",
      "auth",
      "login",
      "register",
      "checkout",
      "confirmation",
    ];

    if (viewName === "profileDashboard") {
      els.mainHeader.classList.add("hidden");
      els.profileHeader.classList.remove("hidden");
    } else if (customHeaderViews.includes(viewName)) {
      els.mainHeader.classList.add("hidden");
      els.profileHeader.classList.add("hidden");
    } else {
      els.mainHeader.classList.remove("hidden");
      els.profileHeader.classList.add("hidden");
    }

    // Render dynamic views appropriately prior to displaying
    if (viewName === "wishlist") renderWishlist();
    if (viewName === "recent") renderRecent();
    if (viewName === "settingsAccount" && currentUser) {
      document.getElementById("acct-name").value = currentUser.name || "";
      document.getElementById("acct-email").value = currentUser.email || "";
      document.getElementById("acct-phone").value = currentUser.phone || "";
    }

    Object.values(els.views).forEach((view) => {
      if (view) view.classList.add("hidden");
    });

    if (els.views[viewName]) {
      els.views[viewName].classList.remove("hidden");
    }
    window.scrollTo(0, 0);

    els.navItems.forEach((item) => {
      item.classList.remove("active", "text-brand");
      if (!item.classList.contains("text-gray-400")) {
        item.classList.add("text-gray-400");
      }
    });

    let navBtnTarget = viewName;
    if (
      [
        "auth",
        "login",
        "register",
        "profileDashboard",
        "settings",
        "settingsAccount",
        "settingsAddress",
        "settingsCurrency",
        "settingsLanguage",
        "wishlist",
        "recent",
      ].includes(viewName)
    ) {
      navBtnTarget = "profile";
    }

    const activeNavBtn = document.querySelector(
      `.nav-item[data-nav="${navBtnTarget}"]`,
    );
    if (activeNavBtn) {
      activeNavBtn.classList.add("active", "text-brand");
      activeNavBtn.classList.remove("text-gray-400");
    }
  };

  // --- Auth & Account Logic ---
  const updateProfileUI = () => {
    if (currentUser) {
      document.getElementById("profile-name").innerText = currentUser.name;
      document.getElementById("profile-email").innerText = currentUser.email;
      document.getElementById("profile-initial").innerText = currentUser.name
        .charAt(0)
        .toUpperCase();

      const settingsEmailEl = document.getElementById("settings-email");
      if (settingsEmailEl) settingsEmailEl.innerText = currentUser.email;
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const errorEl = document.getElementById("reg-error");

    if (users.find((u) => u.email === email)) {
      errorEl.classList.remove("hidden");
      return;
    }

    errorEl.classList.add("hidden");
    const newUser = { name, email, password, phone: "" };
    users.push(newUser);
    localStorage.setItem("dropout_users", JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem("dropout_user", JSON.stringify(currentUser));
    updateProfileUI();

    e.target.reset();
    navigate("profile");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");

    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      errorEl.classList.add("hidden");
      currentUser = user;
      localStorage.setItem("dropout_user", JSON.stringify(currentUser));
      updateProfileUI();
      e.target.reset();
      navigate("profile");
    } else {
      errorEl.classList.remove("hidden");
    }
  };

  const saveAccountDetails = () => {
    const newName = document.getElementById("acct-name").value;
    const newPhone = document.getElementById("acct-phone").value;
    if (newName) currentUser.name = newName;
    currentUser.phone = newPhone;
    localStorage.setItem("dropout_user", JSON.stringify(currentUser));

    const idx = users.findIndex((u) => u.email === currentUser.email);
    if (idx > -1) users[idx] = currentUser;
    localStorage.setItem("dropout_users", JSON.stringify(users));

    updateProfileUI();
    navigate("settings");
  };

  const handleLogout = () => {
    currentUser = null;
    localStorage.removeItem("dropout_user");
    navigate("profile");
  };

  const updateSetting = (key, val) => {
    if (key === "currency")
      document.getElementById("display-currency").innerText = val;
    if (key === "language")
      document.getElementById("display-language").innerText = val;
  };

  // --- Wishlist & Recent Features ---
  const toggleWishlist = (id, event) => {
    event.stopPropagation();
    const index = wishlist.indexOf(id);
    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(id);
    }
    localStorage.setItem("dropout_wishlist", JSON.stringify(wishlist));

    // Re-render visible lists
    if (!els.views.home.classList.contains("hidden")) renderProducts();
    if (!els.views.wishlist.classList.contains("hidden")) renderWishlist();
    if (!els.views.recent.classList.contains("hidden")) renderRecent();
    if (!els.searchOverlay.classList.contains("hidden"))
      performSearch(els.searchInput.value);
  };

  // Product Template Helper
  const getProductCardHTML = (product) => {
    const isWishlisted = wishlist.includes(product.id);
    const heartIcon = isWishlisted
      ? "las la-heart text-red-500"
      : "lar la-heart text-brand";

    return `
                    <div class="group cursor-pointer active:scale-[0.98] transition-transform duration-200 relative" onclick="app.openProductModal(${product.id})">
                        <button onclick="app.toggleWishlist(${product.id}, event)" class="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full shadow-sm flex items-center justify-center z-20 hover:bg-gray-50 transition-colors">
                            <i class="${heartIcon} text-lg"></i>
                        </button>
                        <div class="relative w-full aspect-[4/5] bg-brand-light rounded-2xl overflow-hidden mb-3">
                            <img src="${product.images[product.colors[0]]}" alt="${product.name}" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out">
                            <button class="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-brand opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 sm:flex hidden z-10">
                                <i class="las la-plus text-xl"></i>
                            </button>
                        </div>
                        <div class="px-1">
                            <h3 class="text-sm font-bold text-gray-900 truncate">${product.name}</h3>
                            <div class="flex justify-between items-center mt-1">
                                <p class="text-xs font-semibold text-gray-500">${product.colors.length} Colors</p>
                                <p class="text-sm font-black text-brand">${formatPrice(product.price)}</p>
                            </div>
                        </div>
                    </div>
                `;
  };

  const renderWishlist = () => {
    const items = products.filter((p) => wishlist.includes(p.id));
    if (items.length === 0) {
      els.wishlistGrid.innerHTML = `
                        <div class="col-span-2 lg:col-span-4 py-20 text-center flex flex-col items-center">
                            <i class="lar la-heart text-6xl text-gray-300 mb-4"></i>
                            <h3 class="text-xl font-black mb-1">Your wishlist is empty</h3>
                            <p class="text-gray-500 text-sm font-medium">Save items you love to revisit them later.</p>
                            <button onclick="app.navigate('home')" class="mt-6 bg-brand text-white px-6 py-3 rounded-xl font-bold shadow-md active:scale-95 transition-transform">Explore Drops</button>
                        </div>
                    `;
    } else {
      els.wishlistGrid.innerHTML = items.map(getProductCardHTML).join("");
    }
  };

  const renderRecent = () => {
    const items = recent
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);
    if (items.length === 0) {
      els.recentGrid.innerHTML = `
                        <div class="col-span-2 lg:col-span-4 py-20 text-center flex flex-col items-center">
                            <i class="las la-history text-6xl text-gray-300 mb-4"></i>
                            <h3 class="text-xl font-black mb-1">No recent views</h3>
                            <p class="text-gray-500 text-sm font-medium">Items you look at will appear here.</p>
                        </div>
                    `;
    } else {
      els.recentGrid.innerHTML = items.map(getProductCardHTML).join("");
    }
  };

  // --- Search Logic ---
  const openSearch = () => {
    els.searchOverlay.classList.remove("hidden");
    void els.searchOverlay.offsetWidth;
    els.searchOverlay.classList.remove("translate-y-full");
    els.searchInput.focus();
    document.body.style.overflow = "hidden";
  };

  const closeSearch = () => {
    els.searchOverlay.classList.add("translate-y-full");
    setTimeout(() => {
      els.searchOverlay.classList.add("hidden");
      els.searchInput.value = "";
      els.searchResults.innerHTML = "";
      els.searchEmpty.classList.add("hidden");
    }, 300);
    document.body.style.overflow = "";
  };

  const performSearch = (query) => {
    if (!query.trim()) {
      els.searchResults.innerHTML = "";
      els.searchEmpty.classList.add("hidden");
      return;
    }
    const q = query.toLowerCase();
    const results = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q),
    );

    if (results.length === 0) {
      els.searchResults.innerHTML = "";
      els.searchEmpty.classList.remove("hidden");
    } else {
      els.searchEmpty.classList.add("hidden");
      els.searchResults.innerHTML = results.map(getProductCardHTML).join("");
    }
  };

  // --- Category Filter Logic ---
  const setCategory = (category) => {
    currentCategory = category;

    els.categoryBtns.forEach((btn) => {
      if (btn.dataset.category === category) {
        btn.classList.remove(
          "text-gray-400",
          "hover:text-brand",
          "font-medium",
        );
        btn.classList.add(
          "border-b-2",
          "border-brand",
          "text-brand",
          "font-semibold",
        );
      } else {
        btn.classList.add("text-gray-400", "hover:text-brand", "font-medium");
        btn.classList.remove(
          "border-b-2",
          "border-brand",
          "text-brand",
          "font-semibold",
        );
      }
    });

    renderProducts();
  };

  // --- Products ---
  const renderProducts = () => {
    const filteredProducts =
      currentCategory === "All Drops"
        ? products
        : products.filter((p) => p.category === currentCategory);

    if (filteredProducts.length === 0) {
      els.grid.innerHTML = `
                        <div class="col-span-2 lg:col-span-4 py-16 text-center">
                            <i class="las la-box-open text-5xl text-gray-300 mb-3"></i>
                            <p class="text-gray-500 font-medium">No items found in this category yet.</p>
                        </div>
                    `;
      return;
    }

    els.grid.innerHTML = filteredProducts.map(getProductCardHTML).join("");
  };

  // --- Modal Logic ---
  const openProductModal = (id) => {
    // Add to recent
    recent = [id, ...recent.filter((r) => r !== id)].slice(0, 10);
    localStorage.setItem("dropout_recent", JSON.stringify(recent));

    currentActiveProduct = products.find((p) => p.id === id);
    currentSelectedColor = currentActiveProduct.colors[0];
    currentModalQty = 1;

    els.modal.img.src = currentActiveProduct.images[currentSelectedColor];
    els.modal.title.innerText = currentActiveProduct.name;
    els.modal.price.innerText = formatPrice(currentActiveProduct.price);
    els.modal.desc.innerText = currentActiveProduct.desc;
    els.modal.qty.innerText = currentModalQty;

    renderModalColors();

    els.modal.addBtn.onclick = () => {
      addToCart(currentActiveProduct, currentSelectedColor, currentModalQty);
      closeModal();
      setTimeout(() => toggleCart(true), 350);
    };

    els.modal.wrap.classList.remove("hidden");
    void els.modal.wrap.offsetWidth;
    els.modal.bg.classList.remove("opacity-0");

    els.modal.content.classList.remove(
      "translate-y-full",
      "sm:translate-y-0",
      "sm:scale-95",
    );
    els.modal.content.classList.add("translate-y-0", "sm:scale-100");
  };

  const renderModalColors = () => {
    els.modal.colorLabel.innerText = currentSelectedColor;
    els.modal.colors.innerHTML = currentActiveProduct.colors
      .map(
        (color) => `
                    <button onclick="app.selectColor('${color}')" class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      currentSelectedColor === color
                        ? "bg-brand text-white shadow-md border-2 border-brand"
                        : "bg-brand-light text-gray-600 border-2 border-transparent hover:bg-gray-200"
                    }">${color}</button>
                `,
      )
      .join("");
  };

  const selectColor = (color) => {
    currentSelectedColor = color;

    els.modal.img.style.opacity = 0;
    setTimeout(() => {
      els.modal.img.src = currentActiveProduct.images[currentSelectedColor];
      els.modal.img.style.opacity = 1;
    }, 150);

    renderModalColors();
  };

  const updateModalQty = (change) => {
    if (currentModalQty + change > 0) {
      currentModalQty += change;
      els.modal.qty.innerText = currentModalQty;
    }
  };

  const closeModal = () => {
    els.modal.bg.classList.add("opacity-0");
    els.modal.content.classList.remove("translate-y-0", "sm:scale-100");
    els.modal.content.classList.add(
      "translate-y-full",
      "sm:translate-y-0",
      "sm:scale-95",
    );
    setTimeout(() => {
      els.modal.wrap.classList.add("hidden");
    }, 300);
  };

  // --- Cart Logic ---
  const saveCart = () => {
    localStorage.setItem("dropout_cart", JSON.stringify(cart));
    updateCartUI();
  };

  const addToCart = (product, color, qty) => {
    const existingItem = cart.find(
      (item) => item.id === product.id && item.color === color,
    );
    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[color],
        color: color,
        qty: qty,
        selected: true,
      });
    }
    saveCart();
  };

  const updateCartQty = (index, change) => {
    if (cart[index].qty + change > 0) {
      cart[index].qty += change;
    } else {
      cart.splice(index, 1);
    }
    saveCart();
  };

  const toggleItemSelection = (index) => {
    cart[index].selected = !cart[index].selected;
    saveCart();
  };

  const updateCartUI = () => {
    const selectedItems = cart.filter((item) => item.selected !== false);
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const selectedCount = selectedItems.reduce(
      (sum, item) => sum + item.qty,
      0,
    );
    const totalPrice = selectedItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );

    els.cartBadges.forEach((badge) => {
      if (totalItems > 0) {
        badge.innerText = totalItems;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    });

    if (cart.length === 0) {
      els.cartItemsList.innerHTML = "";
      els.cartEmpty.classList.remove("hidden");
      els.cartFooter.classList.add("hidden");
    } else {
      els.cartEmpty.classList.add("hidden");
      els.cartFooter.classList.remove("hidden");

      els.cartItemsList.innerHTML = cart
        .map(
          (item, index) => `
                        <div class="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                            <input type="checkbox" ${item.selected !== false ? "checked" : ""} onchange="app.toggleItemSelection(${index})" class="w-5 h-5 ml-1 text-brand focus:ring-brand border-gray-300 rounded cursor-pointer">
                            
                            <div class="w-16 h-20 bg-brand-light rounded-xl overflow-hidden flex-shrink-0">
                                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-start mb-1">
                                    <h4 class="text-sm font-bold text-gray-900 truncate pr-2">${item.name}</h4>
                                    <p class="text-sm font-black text-brand">${formatPrice(item.price * item.qty)}</p>
                                </div>
                                <p class="text-xs font-semibold text-gray-500 mb-2">${item.color}</p>
                                
                                <div class="flex items-center bg-brand-light rounded-lg w-24 p-1">
                                    <button onclick="app.updateCartQty(${index}, -1)" class="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black rounded-md active:bg-white"><i class="las la-minus text-xs"></i></button>
                                    <span class="flex-1 text-center font-bold text-sm">${item.qty}</span>
                                    <button onclick="app.updateCartQty(${index}, 1)" class="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black rounded-md active:bg-white"><i class="las la-plus text-xs"></i></button>
                                </div>
                            </div>
                        </div>
                    `,
        )
        .join("");

      els.cartSubtotal.innerText = formatPrice(totalPrice);
      els.cartSelectedCount.innerText = selectedCount;
    }
  };

  const toggleCart = (forceOpen = false) => {
    const isOpen = !els.cartDrawer.classList.contains("translate-x-full");

    if (isOpen && !forceOpen) {
      els.cartDrawer.classList.add("translate-x-full");
      els.cartOverlay.classList.remove("opacity-100");
      setTimeout(() => els.cartOverlay.classList.add("hidden"), 300);
      document.body.style.overflow = "";
    } else {
      els.cartOverlay.classList.remove("hidden");
      void els.cartOverlay.offsetWidth;
      els.cartOverlay.classList.add("opacity-100");
      els.cartDrawer.classList.remove("translate-x-full");
      document.body.style.overflow = "hidden";
    }
  };

  // --- Checkout Logic ---
  const renderCheckoutSummary = () => {
    const selectedItems = cart.filter((item) => item.selected !== false);
    const totalPrice = selectedItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );

    els.checkoutItems.innerHTML = selectedItems
      .map(
        (item) => `
                    <div class="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                        <img src="${item.image}" class="w-14 h-14 rounded-xl object-cover bg-brand-light">
                        <div class="flex-1">
                            <h4 class="text-sm font-bold text-gray-900">${item.name}</h4>
                            <p class="text-xs font-semibold text-gray-500">${item.color} <span class="mx-1">•</span> Qty: ${item.qty}</p>
                        </div>
                        <p class="text-sm font-black text-brand">${formatPrice(item.price * item.qty)}</p>
                    </div>
                `,
      )
      .join("");

    els.checkoutTotal.innerText = formatPrice(totalPrice);
  };

  const proceedToCheckout = () => {
    const selectedItems = cart.filter((item) => item.selected !== false);
    if (selectedItems.length === 0) return;

    renderCheckoutSummary();
    toggleCart();
    navigate("checkout");
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<i class="las la-circle-notch la-spin text-xl"></i> Processing...`;
    btn.disabled = true;

    setTimeout(() => {
      cart = cart.filter((item) => item.selected === false);
      saveCart();

      e.target.reset();
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      navigate("confirmation");
    }, 1500);
  };

  window.addEventListener("DOMContentLoaded", init);

  return {
    navigate,
    setCategory,
    handleRegister,
    handleLogin,
    handleLogout,
    saveAccountDetails,
    updateSetting,
    toggleWishlist,
    openSearch,
    closeSearch,
    performSearch,
    openProductModal,
    closeModal,
    selectColor,
    updateModalQty,
    toggleCart,
    updateCartQty,
    toggleItemSelection,
    proceedToCheckout,
    handleCheckout,
  };
})();
S;
