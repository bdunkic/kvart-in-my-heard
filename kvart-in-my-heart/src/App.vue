<template>
  <div class="min-h-screen bg-gray-100 font-sans text-gray-800 flex flex-col">
    <!-- HEADER -->
    <header class="bg-zgblue text-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 class="text-2xl font-bold flex items-center gap-2">🏙️ Kvart In My ❤️</h1>
        <select v-model="odabraniKvart" @change="dohvatiPodatke" class="bg-white text-gray-800 rounded px-3 py-2 font-semibold focus:outline-none cursor-pointer">
          <option v-for="kvart in kvartovi" :key="kvart" :value="kvart">{{ kvart }}</option>
        </select>
      </div>
    </header>

    <!-- MAIN -->
    <main class="container mx-auto px-4 py-8 flex-grow">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Oglasna ploča: <span class="text-heartred">{{ odabraniKvart }}</span></h2>
        <button class="bg-heartred text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition">Prijavi problem</button>
      </div>

      <!-- LOADER -->
      <div v-if="ucitavanje" class="text-center py-12 text-gray-500 font-medium animate-pulse">
        Dohvaćam podatke s portala Grada Zagreba...
      </div>

      <!-- GRID OBJAVE -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="objava in vijesti" :key="objava.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div class="text-xs font-bold uppercase text-gray-500 mb-2">{{ objava.izvor }}</div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">{{ objava.naslov }}</h3>
          <p class="text-gray-600 text-sm mb-4">{{ objava.opis }}</p>
          <div class="text-xs bg-gray-100 px-2 py-1 rounded inline-block text-gray-600">📍 {{ objava.lokacija }}</div>
        </div>

        <div v-if="vijesti.length === 0" class="col-span-full text-center py-12 text-gray-500">
          Trenutno nema novih komunalnih obavijesti za ovaj kvart.
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const odabraniKvart = ref('Trešnjevka - sjever');
const ucitavanje = ref(false);
const vijesti = ref([]);

const kvartovi = [
  'Donji Grad', 'Gornji Grad - Medveščak', 'Trnje', 'Maksimir', 
  'Peščenica - Žitnjak', 'Novi Zagreb - istok', 'Novi Zagreb - zapad', 
  'Trešnjevka - sjever', 'Trešnjevka - jug', 'Črnomerec', 
  'Gornja Dubrava', 'Donja Dubrava', 'Stenjevec', 'Podsused - Vrapče', 
  'Podsljeme', 'Sesvete', 'Brezovica'
];

// Funkcija za dohvaćanje podataka (Simulacija + stvarni API pristup)
const dohvatiPodatke = async () => {
  ucitavanje.value = true;
  vijesti.value = [];
  
  try {
    // OVDJE IDE PRAVI API POZIV PREMA ZAGREB DATA PORTALU
    // Za potrebe drafta, simuliramo delay pravog servera od 1 sekunde
    await new Promise(resolve => setTimeout(resolve, 800));

    // Ovdje bi filtrirali pravi JSON response s data.zagreb.hr prema odabraniKvart.value
    // Generiramo mock podatke ovisno o kvartu da vidiš kako aplikacija reagira
    if (odabraniKvart.value === 'Trešnjevka - sjever') {
      vijesti.value = [
        { id: 1, izvor: 'Zagrebačke ceste (Open Data)', naslov: 'Sanacija kolnika', opis: 'Radovi na sanaciji udarnih rupa na Selskoj cesti.', lokacija: 'Selska cesta' },
        { id: 2, izvor: 'Mjesni odbor', naslov: 'Sjednica vijeća', opis: 'Rasprava o planu malih komunalnih akcija za sljedeću godinu.', lokacija: 'Park Stara Trešnjevka 1' }
      ];
    } else if (odabraniKvart.value === 'Trnje') {
      vijesti.value = [
        { id: 3, izvor: 'Zrinjevac (Open Data)', naslov: 'Košnja trave', opis: 'Planirana košnja zelenih površina oko nasipa.', lokacija: 'Trnjanski nasip' }
      ];
    }
    // Ako nema podataka za kvart, niz ostaje prazan
  } catch (error) {
    console.error("Greška pri dohvaćanju API-ja:", error);
  } finally {
    ucitavanje.value = false;
  }
};

// Pokreni dohvaćanje odmah pri učitavanju stranice
onMounted(() => {
  dohvatiPodatke();
});
</script>
