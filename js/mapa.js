const hoteis = [
    { 
        nome: "Pet Hotel Alpha", 
        endereco: "Rua das Flores, 123, São Paulo", 
        lat: -23.505, 
        lng: -46.850,
        pets: "Cães e Gatos",
        telefone: "11 98765-4321",
        email: "contato@petalpha.com",
        imagens: ["default1.jpg", "default2.jpg", "default3.jpg"],
        instagram: "petalpha",
        facebook: "petalpha",
        whatsapp: "11987654321",
        rating: 5
    },
    { 
        nome: "Pet House Barueri", 
        endereco: "Av. Barueri, 456, Barueri", 
        lat: -23.511, 
        lng: -46.875,
        pets: "Cães",
        telefone: "11 91234-5678",
        email: "contato@petbarueri.com",
        imagens: ["default1.jpg", "default2.jpg", "default3.jpg"],
        instagram: "pethousebarueri",
        facebook: "pethousebarueri",
        whatsapp: "11912345678",
        rating: 4
    },
];

// Variável global do mapa
let map;

function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => criarMapa({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            err => {
                console.warn("Erro ao obter localização:", err.message);
                criarMapa({ lat: -23.5505, lng: -46.6333 });
            },
            { enableHighAccuracy: true }
        );
    } else {
        criarMapa({ lat: -23.5505, lng: -46.6333 });
    }
}

function criarMapa(center) {
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([center.lat, center.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomleft" }).addTo(map);

    adicionarMarcadorUsuario(center);
    adicionarHoteis();
}

function adicionarMarcadorUsuario(center) {
    const userIcon = L.divIcon({
        className: "user-marker",
        html: `<div style="width:26px;height:26px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 4px 8px rgba(0,0,0,0.3),0 0 12px rgba(37,99,235,0.5);"></div>`,
        iconSize: [26,26],
        iconAnchor: [13,13]
    });

    L.marker([center.lat, center.lng], { icon: userIcon }).bindPopup("Você").addTo(map);
}

function adicionarHoteis() {
    hoteis.forEach(hotel => adicionarMarcadorHotel(hotel));
}

function adicionarMarcadorHotel(hotel) {
    const icone = L.divIcon({
        className: "hotel-marker",
        html: `<div style="width:24px;height:24px;background:linear-gradient(145deg,#ff4b4b,#e70000);border:3px solid white;border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24,24],
        iconAnchor: [12,12],
    });

    L.marker([hotel.lat, hotel.lng], { icon: icone })
        .addTo(map)
        .on("click", () => {
            exibirHotel(hotel);
            map.setView([hotel.lat, hotel.lng], 15);
        });
}

function exibirHotel(hotel) {
    const box = document.getElementById("hotel-info");
    box.style.display = "block";

    const estrelas = "★".repeat(hotel.rating || 5);

    box.innerHTML = `
        <h2 style="margin-bottom: .5rem;">${hotel.nome}</h2>

        <div class="carousel-container" style="position:relative; overflow:hidden; height:250px; border-radius:10px; margin-bottom:1rem;">
            ${hotel.imagens.map((img, i) => `
                <img src="/img/${img}" class="carousel-img" style="
                    width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0;
                    opacity:${i === 0 ? 1 : 0};
                    transition: opacity .4s;
                ">
            `).join("")}
        </div>

        <div class="hotel-rating" style="text-align:center; font-size:1.5rem; margin-bottom:1rem;">
            ${estrelas}
        </div>

        <div class="hotel-info" style="margin-bottom:0.5rem;">
            <p>Endereço: ${hotel.endereco}</p>
            <p>Pets Aceitos: ${hotel.pets || "Não informado"}</p>
            <p>Email: ${hotel.email || "Não informado"}</p>
            <p>Telefone: ${hotel.telefone || "Não informado"}</p>
        </div>
        <div class="social-links">
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" class="social-item">
                <div class="social-icon whatsapp">
                    <img src="/img/IconWhatsapp.png" alt="WhatsApp">
                </div>
                <span>11 98765-4321</span>
            </a>

            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" class="social-item">
                <div class="social-icon instagram">
                    <img src="/img/IconInstagram.png" alt="Instagram">
                </div>
                <span>@usuario</span>
            </a>

            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" class="social-item">
                <div class="social-icon facebook">
                    <img src="/img/IconFacebook.png" alt="Facebook">
                </div>
                <span>usuario</span>
            </a>
        </div>
    `;
    iniciarCarrossel();
}

function iniciarCarrossel() {
    const imgs = document.querySelectorAll(".carousel-img");
    let idx = 0;
    if (imgs.length <= 1) return;

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
            alert("Endereço não encontrado.");
            return null;
        }

        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };

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
        imagens: ["default1.jpg","default2.jpg","default3.jpg"],
        rating: 5
    };

    hoteis.push(novoHotel);
    adicionarMarcadorHotel(novoHotel);
    alert("Hotel cadastrado com sucesso!");
}

import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

async function carregarHoteisFirebase() {
    try {
        const snapshot = await getDocs(collection(db, "hoteis"));
        snapshot.forEach(doc => {
            const hotel = doc.data();
            if (hotel.coords) {
                const novoHotel = {
                    nome: hotel.nome,
                    endereco: hotel.endereco,
                    lat: hotel.coords.lat,
                    lng: hotel.coords.lng,
                    pets: hotel.pets || "Não informado",
                    telefone: hotel.telefone || "Não informado",
                    email: hotel.email || "Não informado",
                    imagens: hotel.imagens || ["default1.jpg","default2.jpg","default3.jpg"],
                    rating: hotel.rating || 5
                };
                hoteis.push(novoHotel);
                if (map) adicionarMarcadorHotel(novoHotel);
            }
        });
    } catch (err) {
        console.error("Erro ao carregar hotéis do Firebase:", err);
    }
}

window.onload = async () => {
    initMap();                  // inicializa o mapa
    await carregarHoteisFirebase(); // adiciona hotéis do Firebase
};

const searchInput = document.querySelector(".search-input");

searchInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) return;

        // Tenta encontrar hotel pelo nome
        let hotelEncontrado = hoteis.find(h => h.nome.toLowerCase().includes(query));

        // Se não encontrou, tenta pelo endereço
        if (!hotelEncontrado) {
            hotelEncontrado = hoteis.find(h => h.endereco.toLowerCase().includes(query));
        }

        if (hotelEncontrado) {
            // Centraliza mapa no hotel
            map.setView([hotelEncontrado.lat, hotelEncontrado.lng], 15);
            // Mostra box de informações
            exibirHotel(hotelEncontrado);
        } else {
            alert("Hotel não encontrado.");
        }
    }
});



