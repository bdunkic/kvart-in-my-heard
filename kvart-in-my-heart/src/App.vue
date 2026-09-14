<template>
  <div class="min-h-screen bg-gray-100 font-sans text-gray-800 flex flex-col">
    <!-- HEADER -->
    <header class="bg-zgblue text-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 class="text-2xl font-bold flex items-center gap-2">🏙️ Kvart In My ❤️</h1>
        <select v-model="odabraniKvart" @change="promjenaKvarta" class="bg-white text-gray-800 rounded px-3 py-2 font-semibold focus:outline-none cursor-pointer">
          <option v-for="kvart in kvartovi" :key="kvart" :value="kvart">{{ kvart }}</option>
        </select>
      </div>
    </header>

    <!-- MAIN -->
    <main class="container mx-auto px-4 py-8 flex-grow">
      
      <!-- NAVIGACIJA TABOVA (Prikazuje se samo ako ne gledamo detalje) -->
      <div v-if="!odabranaObjava" class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">
          <span v-if="aktivniTab === 'feed'">Oglasna ploča: </span>
          <span v-else>Prijava problema: </span>
          <span class="text-heartred">{{ odabraniKvart }}</span>
        </h2>
        
        <button v-if="aktivniTab === 'feed'" @click="aktivniTab = 'prijava'" class="bg-heartred text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition">
          Prijavi problem
        </button>
        <button v-else @click="aktivniTab = 'feed'" class="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition">
          Natrag na ploču
        </button>
      </div>

      <!-- TAB: OGLASNA PLOČA (FEED) -->
      <div v-if="aktivniTab === 'feed'">
        
        <!-- LOADER -->
        <div v-if="ucitavanje" class="text-center py-12 text-gray-500 font-medium animate-pulse">
          Dohvaćam podatke s portala Grada Zagreba...
        </div>

        <!-- PRIKAZ DETALJA JEDNE OBJAVE -->
        <div v-else-if="odabranaObjava" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-3xl mx-auto animate-fade-in">
          <button @click="odabranaObjava = null" class="mb-6 text-zgblue font-semibold hover:underline flex items-center gap-2">
            &larr; Natrag na ploču
          </button>
          
          <div class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">{{ odabranaObjava.izvor }}</div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{{ odabranaObjava.naslov }}</h2>
          
          <div class="bg-blue-50 border border-blue-100 p-5 rounded-lg mb-6">
            <p class="text-gray-800 text-lg">{{ odabranaObjava.opis }}</p>
          </div>
          
          <div class="flex flex-col gap-3 text-gray-600 bg-gray-50 p-5 rounded-lg border border-gray-100">
            <p class="flex items-start gap-2">
              <span class="text-xl">📍</span> 
              <span><strong>Točna lokacija:</strong> <br>{{ odabranaObjava.lokacija }}</span>
            </p>
            <p class="flex items-center gap-2 mt-2 pt-3 border-t border-gray-200 text-sm text-gray-400">
              <span>Službeni ID zapisa iz registra: {{ odabranaObjava.id }}</span>
            </p>
          </div>
        </div>

        <!-- GRID OBJAVE (Skriva se ako gledamo detalje) -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="objava in vijesti" :key="objava.id" 
               @click="odabranaObjava = objava"
               class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-zgblue transition cursor-pointer flex flex-col justify-between group">
            
            <div>
              <div class="text-xs font-bold uppercase text-gray-500 mb-2">{{ objava.izvor }}</div>
              <h3 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-zgblue transition">{{ objava.naslov }}</h3>
              <!-- Ograničavamo tekst u gridu da sve kartice budu slične visine -->
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ objava.opis }}</p>
            </div>

            <div>
              <div class="text-xs bg-gray-100 px-2 py-1 rounded inline-block text-gray-600 mb-4">📍 {{ objava.lokacija }}</div>
              <div class="text-zgblue text-sm font-semibold flex items-center justify-between">
                <span>Saznaj više</span>
                <span>&rarr;</span>
              </div>
            </div>
          </div>

          <div v-if="vijesti.length === 0" class="col-span-full text-center py-12 text-gray-500">
            Trenutno nema novih komunalnih obavijesti za ovaj kvart.
          </div>
        </div>
      </div>

      <!-- TAB: PRIJAVA PROBLEMA -->
      <div v-if="aktivniTab === 'prijava'" class="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-2xl font-bold mb-4">Prijavi komunalni problem</h3>
        <p class="text-gray-600 mb-6">Prijava za kvart <strong>{{ odabraniKvart }}</strong> bit će vidljiva mjesnom odboru i ostalim građanima.</p>
        
        <form @submit.prevent="posaljiPrijavu" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategorija problema</label>
            <select class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zgblue focus:outline-none">
              <option>Oštećenje na cesti / Asfalt</option>
              <option>Otpad i čistoća</option>
              <option>Zelenilo i parkovi</option>
              <option>Javna rasvjeta</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Opis problema</label>
            <textarea rows="4" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zgblue focus:outline-none" placeholder="Opiši što se točno događa..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Lokacija (Ulica)</label>
            <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zgblue focus:outline-none" placeholder="Npr. Ilica 250">
          </div>
          <button type="submit" class="w-full bg-heartred hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition">
            Pošalji prijavu
          </button>
        </form>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const odabraniKvart = ref('Donji grad');
const aktivniTab = ref('feed');
const odabranaObjava = ref(null); // Novi State: Pamti koju smo objavu kliknuli
const ucitavanje = ref(false);
const vijesti = ref([]);

const kvartovi = [
  'Donji grad', 'Gornji grad - Medveščak', 'Trnje', 'Maksimir', 
  'Peščenica - Žitnjak', 'Novi Zagreb - istok', 'Novi Zagreb - zapad', 
  'Trešnjevka - sjever', 'Trešnjevka - jug', 'Črnomerec', 
  'Gornja Dubrava', 'Donja Dubrava', 'Stenjevec', 'Podsused - Vrapče', 
  'Podsljeme', 'Sesvete', 'Brezovica'
];

// Kad promijenimo kvart, želimo zatvoriti detalje i učitati nove podatke
const promjenaKvarta = () => {
  odabranaObjava.value = null; 
  dohvatiPodatke();
};

const posaljiPrijavu = () => {
  alert(`Tvoja prijava za kvart ${odabraniKvart.value} je uspješno zabilježena u sustav!`);
  aktivniTab.value = 'feed';
};

const dohvatiPodatke = async () => {
  ucitavanje.value = true;
  vijesti.value = [];
  
  const resource_id = '52e56b3a-ad9a-410e-8a83-5f50daac936e'; 
  const apiUrl = `/api/3/action/datastore_search?resource_id=${resource_id}&limit=500`;

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Server je vratio status: ${response.status}`);
    }
    
    const podaci = await response.json();
    const sviZapisi = podaci.result.records;

    const zapisiZaKvart = sviZapisi.filter(zapis => {
      const kvartAPI = zapis["Gradska četvrt"];
      return kvartAPI && kvartAPI.toLowerCase() === odabraniKvart.value.toLowerCase();
    });

    vijesti.value = zapisiZaKvart.map(zapis => {
      return {
        id: zapis._id,
        izvor: zapis["Naslov"] || 'Plan komunalnih akcija',
        naslov: zapis["NAMJENA"] || 'Komunalni radovi', 
        opis: zapis["NAMJENA 2"] ? `${zapis["NAMJENA 2"]} (Procijenjena vrijednost: ${zapis["VRIJEDNOST U EURIMA"]} €)` : 'Detalji u službenom registru.',
        lokacija: zapis["LOKACIJA - OBJEKT"] || 'Točna lokacija nije navedena'
      };
    });

  } catch (error) {
    console.error("Greška pri dohvaćanju API-ja:", error);
    vijesti.value = [{
      id: 'error',
      izvor: 'Sustav',
      naslov: 'Tehnička greška',
      opis: `Uzrok pada: ${error.message}`,
      lokacija: 'Sustav'
    }];
  } finally {
    ucitavanje.value = false;
  }
};

onMounted(() => {
  dohvatiPodatke();
});
</script>
