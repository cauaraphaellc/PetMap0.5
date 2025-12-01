const hoteis = [
    { 
        nome: "Pet Hotel Alpha", 
        endereco: "Rua das Flores, 123, São Paulo", 
        lat: -23.505, 
        lng: -46.850,
        imagens: ["default1.jpg", "default2.jpg", "default3.jpg"],
        rating: 5
    },
    { 
        nome: "Pet House Barueri", 
        endereco: "Av. Barueri, 456, Barueri", 
        lat: -23.511, 
        lng: -46.875,
        imagens: ["default1.jpg", "default2.jpg", "default3.jpg"],
        rating: 5
    },
    { 
        nome: "Dog Resort Jandira", 
        endereco: "Rua Jandira, 789, Jandira", 
        lat: -23.532, 
        lng: -46.902,
        imagens: ["default1.jpg", "default2.jpg", "default3.jpg"],
        rating: 5
    },
];

// Variável global do mapa
let map;


function initMap() {
    // Tenta pegar localização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const userLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };

                criarMapa(userLocation);
            },
            err => {
                console.warn("⚠ Erro ao obter a localização do usuário:", err.message);
                alert("Não foi possível determinar sua localização. Exibindo mapa padrão.");

                // fallback - centro de São Paulo
                criarMapa({ lat: -23.5505, lng: -46.6333 });
            },
            { enableHighAccuracy: true }
        );
    } else {
        alert("Seu navegador não suporta geolocalização.");
        criarMapa({ lat: -23.5505, lng: -46.6333 });
    }
}

function criarMapa(center) {
    // Cria o mapa com estilo clean e controles minimalistas
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([center.lat, center.lng], 14);

    // Camada bonita da Stadia Maps (tema limpo e moderno)
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    // Recoloca o controle de zoom num lugar mais bonito
    L.control.zoom({
        position: "bottomleft"
    }).addTo(map);

    adicionarMarcadorUsuario(center);
    adicionarHoteis();
}

function adicionarMarcadorUsuario(center) {
    const userIcon = L.divIcon({
        className: "user-marker",
        html: `
            <div style="
                width: 26px;
                height: 26px;
                background: #2563EB;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow:
                    0 4px 8px rgba(0,0,0,0.3),
                    0 0 12px rgba(37, 99, 235, 0.5);
            "></div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });

    L.marker([center.lat, center.lng], { icon: userIcon })
        .bindPopup("Você")
        .addTo(map);
}

function adicionarHoteis() {
    hoteis.forEach(hotel => adicionarMarcadorHotel(hotel));
}

function adicionarMarcadorHotel(hotel) {
    const icone = L.divIcon({
        className: "hotel-marker",
        html: `
            <div style="
                width: 24px;
                height: 24px;
                background: linear-gradient(145deg, #ff4b4b, #e70000);
                border: 3px solid white;
                border-radius: 50%;
                box-shadow:
                    0 3px 6px rgba(0, 0, 0, 0.3);
            "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

    L.marker([hotel.lat, hotel.lng], { icon: icone })
        .addTo(map)
        .on("click", () => exibirHotel(hotel));
}

function exibirHotel(hotel) {
    const box = document.getElementById("hotel-info");
    box.style.display = "block";

    // Criar as estrelas conforme rating
    const estrelas = "⭐".repeat(hotel.rating || 5);

    box.innerHTML = `
        <h2 style="color:white; margin-bottom: .5rem;">${hotel.nome}</h2>
        <p style="opacity: .85; margin-bottom: 1rem;">📍 ${hotel.endereco}</p>

        <div class="carousel-container" style="position:relative; overflow:hidden; height:250px; border-radius:10px; margin-bottom:1rem;">
            ${hotel.imagens.map((img, i) => `
                <img src="img/${img}" class="carousel-img" style="
                    width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0;
                    opacity:${i === 0 ? 1 : 0};
                    transition: opacity .4s;
                ">
            `).join("")}
        </div>

        <div style="font-size:1.5rem; margin-bottom:1rem;">${estrelas}</div>
    `;

    iniciarCarrossel();
}

function iniciarCarrossel() {
    const imgs = document.querySelectorAll(".carousel-img");
    let idx = 0;

    if (imgs.length <= 1) return; // Não precisa rodar carrossel com 1 ou 0 imagens

    setInterval(() => {
        imgs[idx].style.opacity = 0;
        idx = (idx + 1) % imgs.length;
        imgs[idx].style.opacity = 1;
    }, 2500);
}

async function obterCoordenadas(endereco) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;

    try {
        const response = await fetch(url, { headers: { "User-Agent": "PetMap/1.0" }});
        const data = await response.json();

        if (data.length === 0) {
            alert("Endereço não encontrado. Tente ser mais específico.");
            return null;
        }

        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
        };

    } catch (error) {
        console.error("Erro ao buscar coordenadas:", error);
        alert("Erro ao converter endereço em coordenadas.");
        return null;
    }
}

async function cadastrarHotel(nome, endereco) {
    const coords = await obterCoordenadas(endereco);

    if (!coords) return;

    const novoHotel = {
        nome: nome,
        endereco: endereco,
        lat: coords.lat,
        lng: coords.lng,
        imagens: ["default1.jpg", "default2.jpg", "default3.jpg"],
        rating: 5
    };

    hoteis.push(novoHotel);
    adicionarMarcadorHotel(novoHotel);

    alert("Hotel cadastrado com sucesso!");
}

// Iniciar automaticamente quando a página carregar
window.onload = initMap;

import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const docRef = doc(db, "hoteis", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const hotel = docSnap.data();

        // Preenche o formulário automaticamente
        const form = document.getElementById("hotel-form");
        if (form) {
            form.nome.value = hotel.nome || "";
            form.endereco.value = hotel.endereco || "";
            form.pets.value = hotel.pets || "";
            form.email.value = hotel.email || "";
            form.telefone.value = hotel.telefone || "";
        }
    }
});



