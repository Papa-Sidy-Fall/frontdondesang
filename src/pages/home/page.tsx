import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-xl">
                <i className="ri-drop-fill text-2xl text-white"></i>
              </div>
              <div className="text-xl font-bold text-red-600">DonSang Sénégal</div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#accueil" className="text-gray-700 hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap">Accueil</a>
              <a href="#apropos" className="text-gray-700 hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap">À propos</a>
              <a href="#comment" className="text-gray-700 hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap">Comment ça marche</a>
              <a href="#temoignages" className="text-gray-700 hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap">Témoignages</a>
              <Link to="/inscription" className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap">
                Devenir Donneur
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 cursor-pointer"
            >
              <i className={`text-2xl ${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-100 pt-4">
              <a 
                href="#accueil" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-red-600 transition-colors cursor-pointer py-2"
              >
                Accueil
              </a>
              <a 
                href="#apropos" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-red-600 transition-colors cursor-pointer py-2"
              >
                À propos
              </a>
              <a 
                href="#comment" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-red-600 transition-colors cursor-pointer py-2"
              >
                Comment ça marche
              </a>
              <a 
                href="#temoignages" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-red-600 transition-colors cursor-pointer py-2"
              >
                Témoignages
              </a>
              <Link 
                to="/inscription" 
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer text-center whitespace-nowrap"
              >
                Devenir Donneur
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://readdy.ai/api/search-image?query=Senegalese%20healthcare%20workers%20and%20volunteers%20in%20modern%20medical%20facility%20with%20warm%20lighting%20showing%20blood%20donation%20campaign%20atmosphere%20with%20red%20and%20green%20colors%20representing%20Senegal%20flag%20professional%20photography%20bright%20clean%20environment&width=1920&height=1080&seq=hero-bg-001&orientation=landscape"
            alt="Don de sang au Sénégal"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center w-full">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Sauvez des Vies<br />
            <span className="text-red-400">Donnez Votre Sang</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Rejoignez la communauté des donneurs de sang au Sénégal. Ensemble, nous pouvons faire la différence et sauver des milliers de vies chaque année grâce à votre générosité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/inscription" className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 transition-all hover:scale-105 whitespace-nowrap cursor-pointer">
              S'inscrire comme Donneur
            </Link>
            <Link to="/recherche" className="bg-white text-red-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all hover:scale-105 whitespace-nowrap cursor-pointer">
              Trouver un Centre
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">15,000+</div>
              <div className="text-white/80 text-lg">Donneurs Actifs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-white/80 text-lg">Centres de Collecte</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">8,500+</div>
              <div className="text-white/80 text-lg">Vies Sauvées</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="apropos" className="py-24 bg-red-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Notre Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Faciliter la collecte et la disponibilité du sang dans tous les hôpitaux du Sénégal grâce à une plateforme numérique innovante
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://readdy.ai/api/search-image?query=African%20medical%20professionals%20in%20modern%20blood%20donation%20center%20with%20digital%20technology%20screens%20showing%20coordination%20system%20warm%20professional%20lighting%20clean%20medical%20environment%20Senegalese%20context&width=800&height=600&seq=about-img-001&orientation=landscape"
                alt="Centre de transfusion sanguine"
                className="w-full h-[500px] object-cover object-top rounded-3xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-14 h-14 flex items-center justify-center bg-red-100 rounded-2xl flex-shrink-0">
                  <i className="ri-heart-pulse-line text-2xl text-red-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Connexion en Temps Réel</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Notre plateforme connecte instantanément les donneurs, les hôpitaux et le Centre National de Transfusion Sanguine pour une coordination optimale des dons de sang.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-2xl flex-shrink-0">
                  <i className="ri-hospital-line text-2xl text-green-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Stocks</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Les hôpitaux peuvent gérer efficacement leurs stocks de sang, signaler les urgences et suivre les rendez-vous des donneurs en temps réel pour éviter les ruptures.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-14 h-14 flex items-center justify-center bg-yellow-100 rounded-2xl flex-shrink-0">
                  <i className="ri-map-pin-line text-2xl text-yellow-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Géolocalisation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Trouvez facilement les centres de collecte les plus proches de vous grâce à notre système de géolocalisation intégré et planifiez votre don en quelques clics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="comment" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comment Ça Marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Donner son sang n'a jamais été aussi simple. Suivez ces 4 étapes faciles
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-6 relative">
                <i className="ri-user-add-line text-3xl text-red-600"></i>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Inscription</h3>
              <p className="text-gray-600 leading-relaxed">
                Créez votre profil en quelques minutes et indiquez votre groupe sanguin
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6 relative">
                <i className="ri-search-line text-3xl text-green-600"></i>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recherche</h3>
              <p className="text-gray-600 leading-relaxed">
                Trouvez le centre de collecte le plus proche de votre position
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-yellow-100 rounded-full mx-auto mb-6 relative">
                <i className="ri-calendar-check-line text-3xl text-yellow-600"></i>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Rendez-vous</h3>
              <p className="text-gray-600 leading-relaxed">
                Prenez rendez-vous en ligne selon vos disponibilités
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-6 relative">
                <i className="ri-heart-fill text-3xl text-red-600"></i>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Don</h3>
              <p className="text-gray-600 leading-relaxed">
                Rendez-vous au centre et sauvez des vies en 30 minutes
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/inscription" className="inline-block bg-red-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-red-700 transition-all hover:scale-105 whitespace-nowrap cursor-pointer">
              Commencer Maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="temoignages" className="py-24 bg-red-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Témoignages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les histoires inspirantes de nos donneurs et bénéficiaires
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-smile-line text-2xl text-red-600"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Amadou Diallo</h4>
                  <p className="text-gray-600 text-sm">Donneur régulier</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
              </div>
              <p className="text-gray-600 leading-relaxed">
                "Grâce à cette plateforme, j'ai pu donner mon sang 5 fois cette année. C'est simple, rapide et je sais que je contribue à sauver des vies au Sénégal. Je recommande à tous !"
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-smile-line text-2xl text-green-600"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Dr. Fatou Sall</h4>
                  <p className="text-gray-600 text-sm">Hôpital Régional de Thiès</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
              </div>
              <p className="text-gray-600 leading-relaxed">
                "Cette plateforme a révolutionné notre gestion des stocks de sang. Nous pouvons maintenant contacter rapidement les donneurs en cas d'urgence. Un outil indispensable !"
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-smile-line text-2xl text-yellow-600"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Mariama Ndiaye</h4>
                  <p className="text-gray-600 text-sm">Bénéficiaire</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
              </div>
              <p className="text-gray-600 leading-relaxed">
                "Ma vie a été sauvée grâce à un donneur trouvé via cette plateforme. Je suis éternellement reconnaissante. Merci à tous les donneurs généreux du Sénégal !"
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white rounded-3xl p-12 shadow-xl text-center">
            <div className="max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-heart-pulse-fill text-4xl text-red-600"></i>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Rejoignez Notre Communauté
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Plus de 15 000 donneurs nous font déjà confiance. Ensemble, nous avons sauvé plus de 8 500 vies au Sénégal. Votre don peut faire la différence aujourd'hui.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/inscription" className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 transition-all hover:scale-105 whitespace-nowrap cursor-pointer">
                  Devenir Donneur
                </Link>
                <Link to="/recherche" className="bg-gray-100 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-all hover:scale-105 whitespace-nowrap cursor-pointer">
                  Trouver un Centre
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète pour tous les acteurs du don de sang au Sénégal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/inscription" className="group bg-red-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-red-100 hover:border-red-300 cursor-pointer">
              <div className="w-16 h-16 flex items-center justify-center bg-red-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="ri-user-heart-line text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Pour les Donneurs</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Inscrivez-vous facilement, indiquez votre groupe sanguin, consultez les centres de collecte proches et recevez des notifications pour les urgences.
              </p>
              <div className="flex items-center text-red-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                S'inscrire maintenant
                <i className="ri-arrow-right-line"></i>
              </div>
            </Link>

            <Link to="/gestion-hopital" className="group bg-green-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-green-100 hover:border-green-300 cursor-pointer">
              <div className="w-16 h-16 flex items-center justify-center bg-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="ri-hospital-fill text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Pour les Hôpitaux</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Gérez vos stocks de sang, envoyez des notifications aux donneurs, signalez les urgences et suivez les rendez-vous en temps réel.
              </p>
              <div className="flex items-center text-green-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                Accéder au portail
                <i className="ri-arrow-right-line"></i>
              </div>
            </Link>

            <Link to="/administration" className="group bg-yellow-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-yellow-100 hover:border-yellow-300 cursor-pointer">
              <div className="w-16 h-16 flex items-center justify-center bg-yellow-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <i className="ri-dashboard-line text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Administration</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Supervisez toutes les opérations, générez des statistiques détaillées et organisez des campagnes de sensibilisation efficaces.
              </p>
              <div className="flex items-center text-yellow-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                Tableau de bord
                <i className="ri-arrow-right-line"></i>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-red-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à Sauver des Vies ?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Chaque don compte. Rejoignez notre communauté de héros du quotidien et contribuez à sauver des vies au Sénégal. L'inscription ne prend que quelques minutes.
          </p>
          <Link to="/inscription" className="inline-block bg-white text-red-600 px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-all hover:scale-105 whitespace-nowrap cursor-pointer">
            Commencer Maintenant
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contactez-Nous
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une question ? Notre équipe est là pour vous aider
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 bg-red-50 rounded-2xl">
              <div className="w-14 h-14 flex items-center justify-center bg-red-600 rounded-full mx-auto mb-4">
                <i className="ri-phone-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Téléphone</h3>
              <p className="text-gray-600">+221 33 XXX XX XX</p>
            </div>

            <div className="text-center p-8 bg-red-50 rounded-2xl">
              <div className="w-14 h-14 flex items-center justify-center bg-red-600 rounded-full mx-auto mb-4">
                <i className="ri-mail-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">contact@donsang.sn</p>
            </div>

            <div className="text-center p-8 bg-red-50 rounded-2xl">
              <div className="w-14 h-14 flex items-center justify-center bg-red-600 rounded-full mx-auto mb-4">
                <i className="ri-map-pin-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Adresse</h3>
              <p className="text-gray-600">Dakar, Sénégal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
                  <i className="ri-drop-fill text-xl text-white"></i>
                </div>
                <span className="text-xl font-bold">DonSang Sénégal</span>
              </div>
              <p className="text-white/80 leading-relaxed">
                Ensemble pour sauver des vies au Sénégal
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><a href="#accueil" className="text-white/80 hover:text-white transition-colors cursor-pointer">Accueil</a></li>
                <li><a href="#apropos" className="text-white/80 hover:text-white transition-colors cursor-pointer">À propos</a></li>
                <li><a href="#services" className="text-white/80 hover:text-white transition-colors cursor-pointer">Services</a></li>
                <li><a href="#contact" className="text-white/80 hover:text-white transition-colors cursor-pointer">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><Link to="/inscription" className="text-white/80 hover:text-white transition-colors cursor-pointer">Inscription Donneur</Link></li>
                <li><Link to="/recherche" className="text-white/80 hover:text-white transition-colors cursor-pointer">Recherche Centre</Link></li>
                <li><Link to="/gestion-hopital" className="text-white/80 hover:text-white transition-colors cursor-pointer">Gestion Hôpital</Link></li>
                <li><Link to="/administration" className="text-white/80 hover:text-white transition-colors cursor-pointer">Administration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Suivez-nous</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                  <i className="ri-facebook-fill text-xl"></i>
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                  <i className="ri-twitter-fill text-xl"></i>
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                  <i className="ri-instagram-fill text-xl"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm">© 2025 Don de Sang Sénégal. Tous droits réservés.</p>
            <a href="https://readdy.ai/?ref=logo" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white text-sm transition-colors cursor-pointer">
              Powered by Readdy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
