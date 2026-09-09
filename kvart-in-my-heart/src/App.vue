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
  const apiUrl = `https://data.zagreb.hr/api/3/action/datastore_search?resource_id=${resource_id}&limit=100`;

  try {
    // 1. Šaljemo upit na zagrebački server
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Mreža nije odgovorila ispravno');
    }
    
    // 2. Pretvaramo odgovor u JSON format
    const podaci = await response.json();
    
    // CKAN API uvijek drži podatke unutar "result.records"
    const sviZapisi = podaci.result.records;

    // 3. Filtriramo podatke samo za odabrani kvart
    // PAŽNJA: Ime polja (npr. 'gradska_cetvrt') mora točno odgovarati imenu stupca u tablici na portalu!
    const zapisiZaKvart = sviZapisi.filter(zapis => 
      zapis.gradska_cetvrt === odabraniKvart.value || 
      zapis.Gradska_cetvrt === odabraniKvart.value
    );

    // 4. Pretvaramo njihove podatke u format koji naša aplikacija razumije
    vijesti.value = zapisiZaKvart.map(zapis => {
      return {
        id: zapis._id,
        izvor: 'Open Data Zagreb',
        // Opet, ova polja (Vrsta_rada, Opis, Lokacija) moraju odgovarati stupcima u njihovoj bazi
        naslov: zapis.Vrsta_rada || zapis.naslov || 'Komunalna obavijest', 
        opis: zapis.Opis || zapis.opis || 'Više detalja dostupno je u službenom registru.',
        lokacija: zapis.Lokacija || zapis.adresa || 'Nepoznata lokacija'
      };
    });

  } catch (error) {
    console.error("Greška pri dohvaćanju API-ja:", error);
    // Možemo ubaciti jednu 'error' vijest da korisnik vidi što se događa
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
