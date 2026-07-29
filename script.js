/* ==========================================
   ELEMENTOS
========================================== */

const productsContainer = document.getElementById("products");
const template = document.getElementById("product-template");

const search = document.getElementById("search");
const filters = document.querySelectorAll(".filter");

const cart = document.getElementById("cart");
const overlay = document.getElementById("overlay");

const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");

const cartContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

const finish = document.getElementById("finish");

let currentCategory = "Todos";

/* ==========================================
   CARRINHO (SALVO)
========================================== */

let cartItems =
JSON.parse(localStorage.getItem("cart")) || [];

function saveCart(){

    localStorage.setItem(
        "cart",
        JSON.stringify(cartItems)
    );

}

/* ==========================================
   RENDER DOS PRODUTOS
========================================== */

function renderProducts(list){

    productsContainer.innerHTML="";

    list.forEach(product=>{

        let currentVariant =
        product.variants[0];

        const clone =
        template.content.cloneNode(true);

        const img =
        clone.querySelector("img");

        const title =
        clone.querySelector("h3");

        const price =
        clone.querySelector(".price");

        const status =
        clone.querySelector(".status");

        const badge =
        clone.querySelector(".badge");

        const button =
        clone.querySelector(".buy");

        img.src =
        currentVariant.image;

        img.alt =
        product.name;

        title.textContent =
        product.name;

        price.textContent =
        `R$ ${currentVariant.price.toFixed(2).replace(".",",")}`;

        if(product.badge){

            badge.textContent =
            product.badge;

        }else{

            badge.style.display =
            "none";

        }

        status.textContent="";

        const materials =
        document.createElement("div");

        materials.className =
        "materials";

        product.variants.forEach(variant=>{

            const materialButton =
            document.createElement("button");

            materialButton.className =
            "material-btn";

            materialButton.textContent =
            variant.material;

            if(variant===currentVariant){

                materialButton.classList.add("active");

            }

            if(!variant.stock){

                materialButton.classList.add("esgotado");

            }

            materialButton.onclick=()=>{

                currentVariant =
                variant;

                img.src =
                variant.image;

                price.textContent =
                `R$ ${variant.price.toFixed(2).replace(".",",")}`;

                materials
                .querySelectorAll(".material-btn")
                .forEach(btn=>
                    btn.classList.remove("active")
                );

                materialButton.classList.add("active");

                if(variant.stock){

                    button.disabled=false;
                    button.textContent="Adicionar ao Carrinho";
                    status.textContent="";

                }else{

                    button.disabled=true;
                    button.textContent="ESGOTADO";
                    status.textContent="Produto indisponível";

                }

            };

            materials.appendChild(materialButton);

        });

        clone.querySelector(".info")
        .insertBefore(materials,status);

        if(!currentVariant.stock){

            button.disabled=true;
            button.textContent="ESGOTADO";
            status.textContent="Produto indisponível";

        }

        button.onclick=()=>{

            if(!currentVariant.stock) return;

            addToCart({

                id:product.id,

                name:product.name,

                material:currentVariant.material,

                image:currentVariant.image,

                price:currentVariant.price

            });

        };

        productsContainer.appendChild(clone);

    });

}
/* ==========================================
   PESQUISA
========================================== */

if(search){

    search.addEventListener("input",updateProducts);

}

/* ==========================================
   FILTROS
========================================== */

filters.forEach(button=>{

    button.addEventListener("click",()=>{

        filters.forEach(btn=>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        currentCategory =
        button.dataset.category;

        updateProducts();

    });

});

/* ==========================================
   ATUALIZAR PRODUTOS
========================================== */

function updateProducts(){

    const value =
    search.value.toLowerCase();

    const filtered =
    products.filter(product=>{

        const sameCategory =

            currentCategory==="Todos" ||

            product.category===currentCategory;

        const matches =

            product.name
            .toLowerCase()
            .includes(value);

        return sameCategory && matches;

    });

    renderProducts(filtered);

}

/* ==========================================
   ABRIR / FECHAR CARRINHO
========================================== */

openCart.addEventListener("click",()=>{

    cart.classList.add("open");

    overlay.classList.add("show");

});

closeCart.addEventListener(
    "click",
    closeCartMenu
);

overlay.addEventListener(
    "click",
    closeCartMenu
);

function closeCartMenu(){

    cart.classList.remove("open");

    overlay.classList.remove("show");

}

/* ==========================================
   TOAST
========================================== */

function showToast(message){

    const toast =
    document.createElement("div");

    toast.className="toast";

    toast.textContent=message;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.remove();

    },2500);

}

/* ==========================================
   ADICIONAR AO CARRINHO
========================================== */

function addToCart(product){

    const item =
    cartItems.find(i=>

        i.id===product.id &&

        i.material===product.material

    );

    if(item){

        item.quantity++;

    }else{

        cartItems.push({

            ...product,

            quantity:1

        });

    }

    saveCart();

    updateCart();

    showToast(
        `${product.name} (${product.material}) adicionado!`
    );

}
/* ==========================================
   ATUALIZAR CARRINHO
========================================== */

function updateCart(){

    cartContainer.innerHTML = "";

    let total = 0;

    let quantity = 0;

    cartItems.forEach(item=>{

        total += item.price * item.quantity;

        quantity += item.quantity;

        const div = document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `

        <img src="${item.image}" alt="${item.name}">

        <div class="cart-info">

            <h4>${item.name}</h4>

            <small>Material: ${item.material}</small>

            <div class="cart-price">

                R$ ${(item.price * item.quantity)
                .toFixed(2)
                .replace(".",",")}

            </div>

            <div class="qty">

                <button class="minus">−</button>

                <span>${item.quantity}</span>

                <button class="plus">+</button>

            </div>

            <div class="remove">

                Remover

            </div>

        </div>

        `;

        /* ======================
           BOTÃO +
        ====================== */

        div.querySelector(".plus").onclick = ()=>{

            item.quantity++;

            saveCart();

            updateCart();

        };

        /* ======================
           BOTÃO -
        ====================== */

        div.querySelector(".minus").onclick = ()=>{

            item.quantity--;

            if(item.quantity <= 0){

                cartItems = cartItems.filter(i=>

                    !(

                        i.id === item.id &&

                        i.material === item.material

                    )

                );

            }

            saveCart();

            updateCart();

        };

        /* ======================
           REMOVER
        ====================== */

        div.querySelector(".remove").onclick = ()=>{

            cartItems = cartItems.filter(i=>

                !(

                    i.id === item.id &&

                    i.material === item.material

                )

            );

            saveCart();

            updateCart();

        };

        cartContainer.appendChild(div);

    });

    cartTotal.textContent =

        "R$ " +

        total.toFixed(2).replace(".",",");

    cartCount.textContent = quantity;

}
/* ==========================================
   FINALIZAR PEDIDO
========================================== */

finish.addEventListener("click",()=>{

    if(cartItems.length===0){

        showToast("Carrinho vazio!");

        return;

    }

    let text =
    "Olá! Gostaria de fazer um pedido:%0A%0A";

    cartItems.forEach(item=>{

        text +=

`${item.quantity}x ${item.name}%0A` +

`Material: ${item.material}%0A` +

`Valor: R$ ${(item.price * item.quantity)
.toFixed(2)
.replace(".",",")}%0A%0A`;

    });

    text += "Total: ";

    text += cartTotal.textContent;

    const phone = "5511992144416";

    window.open(

`https://wa.me/${phone}?text=${text}`,

"_blank"

    );

    // Mantém o carrinho salvo após enviar para o WhatsApp.
    // Se quiser limpar automaticamente, troque as linhas abaixo por:
    // clearCart();

});

/* ==========================================
   LIMPAR CARRINHO
========================================== */

function clearCart(){

    cartItems = [];

    saveCart();

    updateCart();

}

/* ==========================================
   TECLA ESC
========================================== */

document.addEventListener("keydown",e=>{

    if(e.key==="Escape"){

        closeCartMenu();

    }

});

/* ==========================================
   BOTÃO MODO ESCURO
========================================== */

const darkButton =
document.createElement("button");

darkButton.className =
"dark-toggle";

darkButton.innerHTML = "🌙";

document.body.appendChild(darkButton);

darkButton.onclick = ()=>{

    document.body.classList.toggle("dark");

    darkButton.classList.remove("rotate");

    void darkButton.offsetWidth;

    darkButton.classList.add("rotate");

    if(document.body.classList.contains("dark")){

        darkButton.innerHTML = "☀️";

    }else{

        darkButton.innerHTML = "🌙";

    }

};
/* ==========================================
   INICIALIZAÇÃO
========================================== */

// Carrega o carrinho salvo
updateCart();

// Renderiza os produtos
renderProducts(products);


/* ==========================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================== */

window.addEventListener("storage",()=>{

    const savedCart =
    localStorage.getItem("cart");

    if(savedCart){

        cartItems =
        JSON.parse(savedCart);

    }else{

        cartItems = [];

    }

    updateCart();

});


/* ==========================================
   UTILIDADES
========================================== */

function formatPrice(value){

    return "R$ " +

    value
    .toFixed(2)
    .replace(".",",");

}


/* ==========================================
   PRELOAD DAS IMAGENS
========================================== */

products.forEach(product=>{

    if(!product.variants) return;

    product.variants.forEach(variant=>{

        const img = new Image();

        img.src = variant.image;

    });

});


/* ==========================================
   BUSCA COM ENTER
========================================== */

if(search){

    search.addEventListener("keydown",e=>{

        if(e.key==="Enter"){

            const exists = products.some(product=>

                product.name
                .toLowerCase()
                .includes(search.value.toLowerCase())

            );

            if(!exists){

                search.classList.remove("error");

                void search.offsetWidth;

                search.classList.add("error");

                showToast("Produto não encontrado!");

            }

        }

    });

}


/* ==========================================
   LIMPAR CARRINHO APENAS SE O USUÁRIO FECHAR A ABA
   (opcional: remova este bloco se quiser manter
   o carrinho para sempre)
========================================== */

// window.addEventListener("beforeunload",()=>{
//     saveCart();
// });


/* ==========================================
   CONSOLE
========================================== */

console.clear();

console.log("%cYAB Catálogo 2026",
"color:#d4af37;font-size:18px;font-weight:bold;");

console.log(
"Produtos carregados:",
products.length
);

console.log(
"Itens no carrinho:",
cartItems.length
);

console.log(
"Script carregado com sucesso!"
);