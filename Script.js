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
      desc: "Heavy-duty cotton canvas. Features an unstructured crown, custom hardware, and an adjustable fabric strap for the perfect fit.",
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
      desc: "Balances warmth and breathability perfectly. Woven from a premium wool blend to retain shape while keeping you comfortable.",
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
      desc: "A bold nod to the 90s aesthetic. Structured front panels, a flat brim, and a classic plastic snap closure.",
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
      desc: "Built for the outdoors but styled for the city. Features a downward sloping brim and reinforced tonal stitching.",
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
      desc: "Pre-washed for that perfect vintage feel right out of the box. Low profile design with a curved brim.",
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
      desc: "Ultra-lightweight, moisture-wicking, and incredibly breathable. Designed specifically for high-intensity activities.",
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
  let sortOrder = "default";

  // Bypass cart directly via Buy Now flag
  let isDirectCheckout = false;
  let directBuyItem = null;

  // User & Auth State
  let currentUser = JSON.parse(localStorage.getItem("dropout_user")) || null;
  if (currentUser && !currentUser.addresses) currentUser.addresses = [];
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
    desktopNavItems: document.querySelectorAll(".desktop-nav-item"),
    categoryBtns: document.querySelectorAll(".category-btn"),
    searchOverlay: document.getElementById("search-overlay"),
    searchInput: document.getElementById("search-input"),
    searchResults: document.getElementById("search-results"),
    searchEmpty: document.getElementById("search-empty"),
    wishlistGrid: document.getElementById("wishlist-grid"),
    recentGrid: document.getElementById("recent-grid"),
    addressList: document.getElementById("address-list-container"),
    addressModal: {
      wrap: document.getElementById("address-modal"),
      bg: document.getElementById("address-modal-bg"),
      content: document.getElementById("address-modal-content"),
      form: document.getElementById("address-form"),
      title: document.getElementById("address-modal-title"),
    },
    filterModal: {
      wrap: document.getElementById("filter-modal"),
      bg: document.getElementById("filter-modal-bg"),
      content: document.getElementById("filter-modal-content"),
    },
    modal: {
      wrap: document.getElementById("product-modal"),
      bg: document.getElementById("modal-bg"),
      content: document.getElementById("modal-content"),
      img: document.getElementById("modal-img"),
      title: document.getElementById("modal-title"),
      category: document.getElementById("modal-category"),
      price: document.getElementById("modal-price"),
      desc: document.getElementById("modal-desc"),
      colors: document.getElementById("modal-colors"),
      colorLabel: document.getElementById("color-label"),
      qty: document.getElementById("modal-qty"),
      addBtn: document.getElementById("modal-add-btn"),
      buyBtn: document.getElementById("modal-buy-btn"),
    },
  };

  // Hero Slider Logic
  let currentSlide = 1;
  const rotateHero = () => {
    const totalSlides = 3;
    const prevSlide = document.getElementById(`hero-bg-${currentSlide}`);
    if (prevSlide) prevSlide.classList.replace("opacity-100", "opacity-0");

    currentSlide = currentSlide >= totalSlides ? 1 : currentSlide + 1;
    const nextSlide = document.getElementById(`hero-bg-${currentSlide}`);
    if (nextSlide) nextSlide.classList.replace("opacity-0", "opacity-100");
  };
  setInterval(rotateHero, 4000);

  // --- Initialization ---
  const init = () => {
    renderProducts();
    updateCartUI();
    updateProfileUI();

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

    if (viewName !== "checkout" && viewName !== "confirmation") {
      isDirectCheckout = false;
      directBuyItem = null;
    }

    const hideMainHeaderViews = ["checkout", "confirmation"];
    const desktopNoMainHeaderViews = [
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

    // Desktop & Mobile Main Header Visibility
    if (hideMainHeaderViews.includes(viewName)) {
      els.mainHeader.className =
        "fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-50 transition-opacity duration-300 hidden items-center h-14 sm:h-20";
    } else if (
      desktopNoMainHeaderViews.includes(viewName) ||
      viewName === "profileDashboard"
    ) {
      els.mainHeader.className =
        "fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-50 transition-opacity duration-300 hidden md:flex items-center h-14 sm:h-20";
    } else {
      els.mainHeader.className =
        "fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-50 transition-opacity duration-300 flex items-center h-14 sm:h-20";
    }

    // Profile Mobile Header Logic
    if (viewName === "profileDashboard") {
      els.profileHeader.classList.remove("hidden");
    } else {
      els.profileHeader.classList.add("hidden");
    }

    // Render dynamic view data
    if (viewName === "wishlist") renderWishlist();
    if (viewName === "recent") renderRecent();
    if (viewName === "settingsAccount" && currentUser) {
      document.getElementById("acct-name").value = currentUser.name || "";
      document.getElementById("acct-email").value = currentUser.email || "";
      document.getElementById("acct-phone").value = currentUser.phone || "";
    }
    if (viewName === "settingsAddress") renderAddresses();

    Object.values(els.views).forEach((view) => {
      if (view) view.classList.add("hidden");
    });

    if (els.views[viewName]) {
      els.views[viewName].classList.remove("hidden");
    }
    window.scrollTo(0, 0);

    // Update Active Navs
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

    // Mobile Nav
    els.navItems.forEach((item) => {
      item.classList.remove("active", "text-brand");
      if (!item.classList.contains("text-gray-400"))
        item.classList.add("text-gray-400");
      if (item.dataset.nav === navBtnTarget) {
        item.classList.add("active", "text-brand");
        item.classList.remove("text-gray-400");
      }
    });

    // Desktop Nav
    els.desktopNavItems.forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.nav === navBtnTarget) {
        item.classList.add("active");
      }
    });
  };

  // --- Auth & Account Logic ---
  const updateProfileUI = () => {
    if (currentUser) {
      const nameParts = currentUser.name.split(" ");
      document.getElementById("profile-name").innerText = currentUser.name;
      document.getElementById("profile-email").innerText = currentUser.email;
      document.getElementById("profile-initial").innerText =
        nameParts[0].charAt(0).toUpperCase() +
        (nameParts[1] ? nameParts[1].charAt(0).toUpperCase() : "");

      const settingsEmailEl = document.getElementById("settings-email");
      if (settingsEmailEl) settingsEmailEl.innerText = currentUser.email;
    }
  };

  const saveCurrentUser = () => {
    localStorage.setItem("dropout_user", JSON.stringify(currentUser));
    const idx = users.findIndex((u) => u.email === currentUser.email);
    if (idx > -1) users[idx] = currentUser;
    localStorage.setItem("dropout_users", JSON.stringify(users));
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
    const newUser = { name, email, password, phone: "", addresses: [] };
    users.push(newUser);
    localStorage.setItem("dropout_users", JSON.stringify(users));

    currentUser = newUser;
    saveCurrentUser();
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
      if (!user.addresses) user.addresses = []; // migration safety
      currentUser = user;
      saveCurrentUser();
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
    saveCurrentUser();

    updateProfileUI();
  };

  const handleLogout = () => {
    currentUser = null;
    localStorage.removeItem("dropout_user");
    navigate("profile");
  };

  const updateSetting = (key, val) => {
    if (key === "currency") {
      document.getElementById("display-currency").innerText = val;
    }
    if (key === "language") {
      document.getElementById("display-language").innerText = val;
    }
  };

  // --- Address Book Logic ---
  const renderAddresses = () => {
    if (!currentUser) return;
    const container = els.addressList;
    if (!currentUser.addresses || currentUser.addresses.length === 0) {
      container.innerHTML = `
                        <div class="text-center py-10 bg-white rounded-3xl border border-gray-50 shadow-sm">
                            <i class="las la-map-marker-alt text-5xl text-gray-300 mb-2"></i>
                            <p class="text-gray-500 font-bold text-sm">No addresses saved yet.</p>
                        </div>
                    `;
      return;
    }

    container.innerHTML = currentUser.addresses
      .map(
        (addr) => `
                    <div class="bg-white rounded-2xl shadow-sm p-6 border ${addr.isDefault ? "border-brand" : "border-gray-50 hover:border-gray-200 transition-colors"} relative overflow-hidden">
                        ${addr.isDefault ? '<div class="absolute top-0 right-0 bg-brand text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">DEFAULT</div>' : ""}
                        <h3 class="font-black text-gray-900 mb-1 text-lg">${addr.title}</h3>
                        <p class="text-sm font-bold text-gray-800 mb-1">${addr.name}</p>
                        <p class="text-sm font-medium text-gray-500 leading-relaxed mb-2">${addr.detail}</p>
                        <p class="text-sm font-medium text-gray-500"><i class="las la-phone mr-1"></i> ${addr.phone}</p>
                        <div class="mt-5 flex gap-5 border-t border-gray-50 pt-4">
                            ${!addr.isDefault ? `<button onclick="app.setDefaultAddress('${addr.id}')" class="text-xs font-bold text-brand hover:text-gray-500 transition-colors uppercase tracking-widest flex-1 text-left">Set Default</button>` : ""}
                            <button onclick="app.editAddress('${addr.id}')" class="text-xs font-bold text-gray-500 hover:text-brand transition-colors uppercase tracking-widest">Edit</button>
                            <button onclick="app.deleteAddress('${addr.id}')" class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest">Delete</button>
                        </div>
                    </div>
                `,
      )
      .join("");
  };

  const openAddressForm = (id = null) => {
    const form = els.addressModal.form;
    form.reset();
    if (id && currentUser) {
      const addr = currentUser.addresses.find((a) => a.id === id);
      if (addr) {
        document.getElementById("addr-id").value = addr.id;
        document.getElementById("addr-title").value = addr.title;
        document.getElementById("addr-name").value = addr.name;
        document.getElementById("addr-detail").value = addr.detail;
        document.getElementById("addr-phone").value = addr.phone;
        document.getElementById("addr-default").checked = addr.isDefault;
        els.addressModal.title.innerText = "Edit Address";
      }
    } else {
      document.getElementById("addr-id").value = "";
      if (
        currentUser &&
        (!currentUser.addresses || currentUser.addresses.length === 0)
      ) {
        document.getElementById("addr-default").checked = true; // Auto default first address
      }
      els.addressModal.title.innerText = "Add New Address";
    }

    els.addressModal.wrap.classList.remove("hidden");
    void els.addressModal.wrap.offsetWidth;
    els.addressModal.bg.classList.remove("opacity-0");
    els.addressModal.content.classList.remove(
      "translate-y-full",
      "sm:translate-y-0",
      "sm:scale-95",
    );
    els.addressModal.content.classList.add("translate-y-0", "sm:scale-100");
  };

  const closeAddressForm = () => {
    els.addressModal.bg.classList.add("opacity-0");
    els.addressModal.content.classList.remove("translate-y-0", "sm:scale-100");
    els.addressModal.content.classList.add(
      "translate-y-full",
      "sm:translate-y-0",
      "sm:scale-95",
    );
    setTimeout(() => {
      els.addressModal.wrap.classList.add("hidden");
    }, 300);
  };

  const saveAddress = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const idInput = document.getElementById("addr-id").value;
    const isDefault = document.getElementById("addr-default").checked;

    const newAddr = {
      id: idInput ? idInput : Date.now().toString(),
      title: document.getElementById("addr-title").value,
      name: document.getElementById("addr-name").value,
      detail: document.getElementById("addr-detail").value,
      phone: document.getElementById("addr-phone").value,
      isDefault: isDefault,
    };

    if (!currentUser.addresses) currentUser.addresses = [];

    if (isDefault) {
      currentUser.addresses.forEach((a) => (a.isDefault = false));
    }

    if (idInput) {
      const idx = currentUser.addresses.findIndex((a) => a.id === idInput);
      if (idx > -1) currentUser.addresses[idx] = newAddr;
    } else {
      if (currentUser.addresses.length === 0) newAddr.isDefault = true;
      currentUser.addresses.push(newAddr);
    }

    // Safety: if none default, make first one default
    if (
      currentUser.addresses.length > 0 &&
      !currentUser.addresses.some((a) => a.isDefault)
    ) {
      currentUser.addresses[0].isDefault = true;
    }

    saveCurrentUser();
    renderAddresses();
    closeAddressForm();

    populateCheckoutAddress();
  };

  const deleteAddress = (id) => {
    if (!confirm("Delete this address?")) return;
    currentUser.addresses = currentUser.addresses.filter((a) => a.id !== id);
    if (
      currentUser.addresses.length > 0 &&
      !currentUser.addresses.some((a) => a.isDefault)
    ) {
      currentUser.addresses[0].isDefault = true;
    }
    saveCurrentUser();
    renderAddresses();
  };

  const setDefaultAddress = (id) => {
    currentUser.addresses.forEach((a) => {
      a.isDefault = a.id === id;
    });
    saveCurrentUser();
    renderAddresses();
    populateCheckoutAddress();
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

    if (!els.views.home.classList.contains("hidden")) renderProducts();
    if (!els.views.wishlist.classList.contains("hidden")) renderWishlist();
    if (!els.views.recent.classList.contains("hidden")) renderRecent();
    if (!els.searchOverlay.classList.contains("hidden"))
      performSearch(els.searchInput.value);
  };

  const getProductCardHTML = (product) => {
    const isWishlisted = wishlist.includes(product.id);
    const heartIcon = isWishlisted
      ? "las la-heart text-red-500"
      : "lar la-heart text-brand";
    const bgClass = isWishlisted
      ? "bg-white shadow-sm"
      : "bg-white/80 backdrop-blur shadow-sm hover:bg-white hover:shadow-md";

    return `
                    <div class="group cursor-pointer transition-transform duration-300 relative flex flex-col h-full" onclick="app.openProductModal(${product.id})">
                        <button onclick="app.toggleWishlist(${product.id}, event)" class="absolute top-3 right-3 w-9 h-9 ${bgClass} rounded-full flex items-center justify-center z-20 transition-all active:scale-90">
                            <i class="${heartIcon} text-xl"></i>
                        </button>
                        <div class="relative w-full aspect-[4/5] bg-brand-light rounded-2xl overflow-hidden mb-3">
                            <img src="${product.images[product.colors[0]]}" alt="${product.name}" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out">
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 hidden md:block"></div>
                            <button class="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-brand opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 sm:flex hidden z-10 active:scale-95">
                                <i class="las la-plus text-xl"></i>
                            </button>
                        </div>
                        <div class="px-1 flex flex-col flex-1">
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

  // --- Filters & Sorting ---
  const openFilters = () => {
    els.filterModal.wrap.classList.remove("hidden");
    void els.filterModal.wrap.offsetWidth;
    els.filterModal.bg.classList.remove("opacity-0");
    els.filterModal.content.classList.remove(
      "translate-y-full",
      "sm:translate-y-0",
      "sm:scale-95",
    );
    els.filterModal.content.classList.add("translate-y-0", "sm:scale-100");
  };

  const closeFilters = () => {
    els.filterModal.bg.classList.add("opacity-0");
    els.filterModal.content.classList.remove("translate-y-0", "sm:scale-100");
    els.filterModal.content.classList.add(
      "translate-y-full",
      "sm:translate-y-0",
      "sm:scale-95",
    );
    setTimeout(() => {
      els.filterModal.wrap.classList.add("hidden");
    }, 300);
  };

  const applySort = (val) => {
    sortOrder = val;
    renderProducts();
  };

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

  const renderProducts = () => {
    let filteredProducts =
      currentCategory === "All Drops"
        ? [...products]
        : products.filter((p) => p.category === currentCategory);

    if (sortOrder === "price_asc") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price_desc") {
      filteredProducts.sort((a, b) => b.price - a.price);
    } // default is original array order

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

  // --- Product Modal Logic ---
  const openProductModal = (id) => {
    recent = [id, ...recent.filter((r) => r !== id)].slice(0, 10);
    localStorage.setItem("dropout_recent", JSON.stringify(recent));

    currentActiveProduct = products.find((p) => p.id === id);
    currentSelectedColor = currentActiveProduct.colors[0];
    currentModalQty = 1;

    els.modal.img.src = currentActiveProduct.images[currentSelectedColor];
    els.modal.category.innerText = currentActiveProduct.category;
    els.modal.title.innerText = currentActiveProduct.name;
    els.modal.price.innerText = formatPrice(currentActiveProduct.price);
    els.modal.desc.innerText = currentActiveProduct.desc;
    els.modal.qty.innerText = currentModalQty;

    renderModalColors();

    els.modal.addBtn.onclick = () => {
      addToCart(currentActiveProduct, currentSelectedColor, currentModalQty);
    };

    els.modal.buyBtn.onclick = () => {
      buyNow(currentActiveProduct, currentSelectedColor, currentModalQty);
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
                    <button onclick="app.selectColor('${color}')" class="px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border-2 ${
                      currentSelectedColor === color
                        ? "bg-brand text-white shadow-md border-brand"
                        : "bg-brand-light text-gray-600 border-transparent hover:bg-gray-200"
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

  const buyNow = (product, color, qty) => {
    directBuyItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[color],
      color: color,
      qty: qty,
    };
    isDirectCheckout = true;
    closeModal();
    proceedToCheckout(true);
  };

  const updateCartQty = (index, change) => {
    if (cart[index].qty + change > 0) {
      cart[index].qty += change;
    } else {
      cart.splice(index, 1);
    }
    saveCart();
  };

  const removeCartItem = (index) => {
    cart.splice(index, 1);
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
                        <div class="rounded-2xl border border-gray-50 bg-red-500 overflow-hidden relative shadow-sm h-[104px]">
                            <div class="flex overflow-x-auto hide-scroll snap-x snap-mandatory swipe-container w-full h-full">
                                <!-- Actual Item -->
                                <div class="swipe-item w-full h-full flex-shrink-0 flex items-center gap-3 bg-white p-3 relative group">
                                    <input type="checkbox" ${item.selected !== false ? "checked" : ""} onchange="app.toggleItemSelection(${index})" class="w-5 h-5 ml-1 text-brand focus:ring-brand border-gray-300 rounded cursor-pointer z-10">
                                    
                                    <div class="w-16 h-20 bg-brand-light rounded-xl overflow-hidden flex-shrink-0 z-10">
                                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                                    </div>
                                    <div class="flex-1 min-w-0 z-10">
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
                                    ${item.selected === false ? '<div class="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-0"></div>' : ""}
                                </div>

                                <!-- Delete Action (Revealed on Swipe) -->
                                <button onclick="app.removeCartItem(${index})" class="swipe-item w-20 flex-shrink-0 flex items-center justify-center text-white bg-red-500 active:bg-red-600 transition-colors h-full">
                                    <i class="las la-trash-alt text-3xl"></i>
                                </button>
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
  const populateCheckoutAddress = () => {
    if (currentUser && currentUser.addresses) {
      const defaultAddr =
        currentUser.addresses.find((a) => a.isDefault) ||
        currentUser.addresses[0];
      if (defaultAddr) {
        document.getElementById("checkout-name").value = defaultAddr.name;
        document.getElementById("checkout-email").value = currentUser.email;
        document.getElementById("checkout-address").value =
          defaultAddr.detail + "\n" + defaultAddr.phone;
      } else {
        document.getElementById("checkout-name").value = currentUser.name;
        document.getElementById("checkout-email").value = currentUser.email;
      }
    }
  };

  const renderCheckoutSummary = () => {
    const itemsToCheckout = isDirectCheckout
      ? [directBuyItem]
      : cart.filter((item) => item.selected !== false);
    const subTotal = itemsToCheckout.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    const shipping = 150.0;
    const tax = subTotal * 0.12;
    const finalTotal = subTotal + shipping + tax;

    els.checkoutItems.innerHTML = itemsToCheckout
      .map(
        (item) => `
                    <div class="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                        <img src="${item.image}" class="w-16 h-16 rounded-2xl object-cover bg-brand-light shadow-sm">
                        <div class="flex-1">
                            <h4 class="text-sm font-bold text-gray-900 mb-0.5">${item.name}</h4>
                            <p class="text-xs font-semibold text-gray-500">${item.color} <span class="mx-1">•</span> Qty: ${item.qty}</p>
                        </div>
                        <p class="text-sm font-black text-brand">${formatPrice(item.price * item.qty)}</p>
                    </div>
                `,
      )
      .join("");

    document.getElementById("checkout-subtotal").innerText =
      formatPrice(subTotal);
    document.getElementById("checkout-shipping").innerText =
      formatPrice(shipping);
    document.getElementById("checkout-tax").innerText = formatPrice(tax);
    els.checkoutTotal.innerText = formatPrice(finalTotal);

    populateCheckoutAddress();
  };

  const proceedToCheckout = (isDirect = false) => {
    isDirectCheckout = isDirect;

    if (!isDirectCheckout) {
      const selectedItems = cart.filter((item) => item.selected !== false);
      if (selectedItems.length === 0) return;
    }

    renderCheckoutSummary();
    // Close cart if open
    if (!els.cartDrawer.classList.contains("translate-x-full")) {
      toggleCart();
    }
    navigate("checkout");
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<i class="las la-circle-notch la-spin text-xl"></i> Processing...`;
    btn.disabled = true;

    setTimeout(() => {
      if (!isDirectCheckout) {
        cart = cart.filter((item) => item.selected === false);
        saveCart();
      } else {
        directBuyItem = null;
        isDirectCheckout = false;
      }

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
    openAddressForm,
    closeAddressForm,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    updateSetting,
    toggleWishlist,
    openSearch,
    closeSearch,
    performSearch,
    openFilters,
    closeFilters,
    applySort,
    openProductModal,
    closeModal,
    selectColor,
    updateModalQty,
    toggleCart,
    updateCartQty,
    removeCartItem,
    toggleItemSelection,
    proceedToCheckout,
    handleCheckout,
  };
})();
