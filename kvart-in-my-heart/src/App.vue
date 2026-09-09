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

const dohvatiPodatke = async () => {
  ucitavanje.value = true;
  vijesti.value = [];
  
  // OVDJE ZALIJEPI PRAVI RESOURCE ID S PORTALA DATA.ZAGREB.HR
  const resource_id = '52e56b3a-ad9a-410e-8a83-5f50daac936e'; 
  
  // Koristimo /api umjesto pune domene zbog proxyja koji rješava CORS problem
  const apiUrl = `/api/3/action/datastore_search?resource_id=${resource_id}&limit=100`;

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Mreža nije odgovorila ispravno');
    }
    
    const podaci = await response.json();
    const sviZapisi = podaci.result.records;
    console.log("SVI PODACI S PORTALA:", sviZapisi);


    const zapisiZaKvart = sviZapisi.filter(zapis => 
      zapis.gradska_cetvrt === odabraniKvart.value || 
      zapis.Gradska_cetvrt === odabraniKvart.value
    );

    vijesti.value = zapisiZaKvart.map(zapis => {
      return {
        id: zapis._id,
        izvor: 'Open Data Zagreb',
        naslov: zapis.Vrsta_rada || zapis.naslov || 'Komunalna obavijest', 
        opis: zapis.Opis || zapis.opis || 'Više detalja dostupno je u službenom registru.',
        lokacija: zapis.Lokacija || zapis.adresa || 'Nepoznata lokacija'
      };
    });

  } catch (error) {
    console.error("Greška pri dohvaćanju API-ja:", error);
    vijesti.value = [{
      id: 'error',
      izvor: 'Sustav',
      naslov: 'Greška u spajanju',
      opis: 'Nije moguće povući podatke sa servera Grada Zagreba. Provjerite jeste li unijeli ispravan resource_id.',
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
