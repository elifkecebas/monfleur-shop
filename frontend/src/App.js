import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const API = `${BACKEND_URL}/api`;

const translations = {
  en: {
    siteName: "Mon Fleur",
    nav: { home: "Home", flowers: "Flowers", about: "About Us", contact: "Contact" },
    cart: "Cart",
    hero: {
      title: "Send Happiness",
      subtitle: "With Fresh Flowers",
      description: "Carefully crafted flower bouquets and arrangements for every special occasion. Delivered same day to your loved ones.",
      orderNow: "Order Now",
      viewProducts: "View Products"
    },
    features: {
      delivery: { title: "Same Day Delivery", desc: "Your orders delivered within the same day" },
      fresh: { title: "Fresh Flowers", desc: "Freshest flowers sourced daily" },
      custom: { title: "Custom Design", desc: "Each bouquet carefully and specially crafted" }
    },
    products: {
      title: "Our Flower Collection",
      subtitle: "Special designs for every taste",
      categories: { all: "All Flowers", bouquet: "Bouquets", arrangement: "Arrangements", special: "Special Occasions" },
      addToCart: "Add to Cart"
    },
    about: {
      title: "About Us",
      text1: "With over 25 years of experience in the floristry industry, our expert team offers carefully crafted flower arrangements to make every special moment unforgettable.",
      text2: "With flowers sourced daily, we create perfect bouquets for birthdays, anniversaries, weddings, and other special occasions.",
      moreInfo: "More Information"
    },
    contact: {
      title: "Contact",
      subtitle: "Get in touch with us for custom bouquets and bulk orders",
      phone: "Phone",
      address: "Address",
      addressValue: "Montreal, Canada",
      reachUs: "Send Message",
      form: { name: "Your Name", email: "Your Email", message: "Your Message", send: "Send Message" }
    },
    footer: {
      tagline: "Delivering happiness with fresh flowers",
      quickLinks: "Quick Links",
      categories: "Categories",
      corporate: "Corporate",
      followUs: "Follow Us",
      rights: "All rights reserved."
    }
  },
  fr: {
    siteName: "Mon Fleur",
    nav: { home: "Accueil", flowers: "Fleurs", about: "À Propos", contact: "Contact" },
    cart: "Panier",
    hero: {
      title: "Envoyez le Bonheur",
      subtitle: "Avec des Fleurs Fraîches",
      description: "Bouquets et arrangements floraux soigneusement préparés pour chaque occasion spéciale. Livrés le jour même à vos proches.",
      orderNow: "Commander Maintenant",
      viewProducts: "Voir les Produits"
    },
    features: {
      delivery: { title: "Livraison le Jour Même", desc: "Vos commandes livrées dans la journée" },
      fresh: { title: "Fleurs Fraîches", desc: "Les fleurs les plus fraîches sourcées quotidiennement" },
      custom: { title: "Design Personnalisé", desc: "Chaque bouquet soigneusement et spécialement confectionné" }
    },
    products: {
      title: "Notre Collection de Fleurs",
      subtitle: "Designs spéciaux pour tous les goûts",
      categories: { all: "Toutes les Fleurs", bouquet: "Bouquets", arrangement: "Arrangements", special: "Occasions Spéciales" },
      addToCart: "Ajouter au Panier"
    },
    about: {
      title: "À Propos de Nous",
      text1: "Avec plus de 25 ans d'expérience dans l'industrie florale, notre équipe d'experts propose des arrangements floraux soigneusement préparés pour rendre chaque moment spécial inoubliable.",
      text2: "Avec des fleurs fraîchement sourcées quotidiennement, nous créons des bouquets parfaits pour les anniversaires, les mariages et autres occasions spéciales.",
      moreInfo: "Plus d'Informations"
    },
    contact: {
      title: "Contact",
      subtitle: "Contactez-nous pour des bouquets personnalisés et des commandes en gros",
      phone: "Téléphone",
      address: "Adresse",
      addressValue: "Montréal, Canada",
      reachUs: "Envoyer le Message",
      form: { name: "Votre Nom", email: "Votre E-mail", message: "Votre Message", send: "Envoyer le Message" }
    },
    footer: {
      tagline: "Livrer le bonheur avec des fleurs fraîches",
      quickLinks: "Liens Rapides",
      categories: "Catégories",
      corporate: "Entreprise",
      followUs: "Suivez-Nous",
      rights: "Tous droits réservés."
    }
  }
};

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [language, setLanguage] = useState('en');
  const [flowers, setFlowers] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const t = translations[language];

  useEffect(() => {
    loadFlowers();
  }, []);

  const loadFlowers = async () => {
    try {
      const response = await fetch(`${API}/flowers`);
      const data = await response.json();
      setFlowers(data);
    } catch (err) {
      console.error('Error loading flowers:', err);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      alert(language === 'en' ? 'Message sent successfully!' : 'Message envoyé avec succès!');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      alert(language === 'en' ? 'Error sending message' : 'Erreur lors de l\'envoi du message');
    } finally {
      setFormSubmitting(false);
    }
  };

  const categories = [
    { id: 'all', name: t.products.categories.all },
    { id: 'bouquet', name: t.products.categories.bouquet },
    { id: 'arrangement', name: t.products.categories.arrangement },
    { id: 'special', name: t.products.categories.special }
  ];

  const filteredFlowers = activeCategory === 'all' ? flowers : flowers.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🌸</span>
              <h1 className="text-2xl font-serif font-bold text-rose-800">{t.siteName}</h1>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#" className="text-gray-700 hover:text-rose-600 transition">{t.nav.home}</a>
              <a href="#products" className="text-gray-700 hover:text-rose-600 transition">{t.nav.flowers}</a>
              <a href="#about" className="text-gray-700 hover:text-rose-600 transition">{t.nav.about}</a>
              <a href="#contact" className="text-gray-700 hover:text-rose-600 transition">{t.nav.contact}</a>
              <div className="flex items-center space-x-2 border-l pl-4">
                <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-md transition ${language === 'en' ? 'bg-rose-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>🇬🇧 EN</button>
                <button onClick={() => setLanguage('fr')} className={`px-3 py-1 rounded-md transition ${language === 'fr' ? 'bg-rose-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>🇫🇷 FR</button>
              </div>
            </div>
            <button className="bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition">{t.cart} (0)</button>
          </div>
        </nav>
      </header>

      <section className="relative h-[600px] bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-cover bg-center"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">{t.hero.title} <br /><span className="text-rose-600">{t.hero.subtitle}</span></h2>
            <p className="text-xl text-gray-700 mb-8">{t.hero.description}</p>
            <div className="flex space-x-4">
              <button className="bg-rose-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-rose-700 transition shadow-lg">{t.hero.orderNow}</button>
              <button className="bg-white text-rose-600 px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-50 transition border-2 border-rose-600">{t.hero.viewProducts}</button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6"><div className="text-5xl mb-4">🚚</div><h3 className="text-xl font-semibold text-gray-900 mb-2">{t.features.delivery.title}</h3><p className="text-gray-600">{t.features.delivery.desc}</p></div>
            <div className="text-center p-6"><div className="text-5xl mb-4">💐</div><h3 className="text-xl font-semibold text-gray-900 mb-2">{t.features.fresh.title}</h3><p className="text-gray-600">{t.features.fresh.desc}</p></div>
            <div className="text-center p-6"><div className="text-5xl mb-4">✨</div><h3 className="text-xl font-semibold text-gray-900 mb-2">{t.features.custom.title}</h3><p className="text-gray-600">{t.features.custom.desc}</p></div>
          </div>
        </div>
      </section>

      <section id="products" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">{t.products.title}</h2>
            <p className="text-xl text-gray-600">{t.products.subtitle}</p>
          </div>
          <div className="flex justify-center space-x-4 mb-12">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-6 py-2 rounded-full font-medium transition ${activeCategory === cat.id ? 'bg-rose-600 text-white' : 'bg-white text-gray-700 hover:bg-rose-50'}`}>{cat.name}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFlowers.map(flower => (
              <div key={flower.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group">
                <div className="relative h-80 overflow-hidden">
                  <img src={flower.image} alt={flower.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute top-4 right-4"><button className="bg-white p-3 rounded-full shadow-lg hover:bg-rose-50 transition">❤️</button></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{flower.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-rose-600">{flower.price}</span>
                    <button className="bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition">{t.products.addToCart}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">{t.about.title}</h2>
              <p className="text-lg text-gray-700 mb-4">{t.about.text1}</p>
              <p className="text-lg text-gray-700 mb-6">{t.about.text2}</p>
              <button className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition">{t.about.moreInfo}</button>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-rose-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">{t.contact.title}</h2>
            <p className="text-lg text-gray-700">{t.contact.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">📞</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-xl">{t.contact.phone}</h3>
              <p className="text-gray-700 text-lg">+1 (514) 430-8542</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-xl">{t.contact.address}</h3>
              <p className="text-gray-700 text-lg">{t.contact.addressValue}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{t.contact.reachUs}</h3>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div><label className="block text-gray-700 font-medium mb-2">{t.contact.form.name}</label><input type="text" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition" required /></div>
              <div><label className="block text-gray-700 font-medium mb-2">{t.contact.form.email}</label><input type="email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition" required /></div>
              <div><label className="block text-gray-700 font-medium mb-2">{t.contact.form.message}</label><textarea rows="5" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition resize-none" required></textarea></div>
              <div className="text-center"><button type="submit" disabled={formSubmitting} className="bg-rose-600 text-white px-10 py-3 rounded-full text-lg font-medium hover:bg-rose-700 transition shadow-lg disabled:opacity-50">{formSubmitting ? (language === 'en' ? 'Sending...' : 'Envoi...') : t.contact.form.send}</button></div>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400"><p>&copy; 2024 {t.siteName}. {t.footer.rights}</p></div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
