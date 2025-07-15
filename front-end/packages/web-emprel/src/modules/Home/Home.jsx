import React, { useState, useEffect, useCallback } from 'react';
import Slider from 'react-slick';
import { FaChevronDown } from 'react-icons/fa';

import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import CourseModal from '../../components/CourseModal.jsx';
import RegistrationModal from '../../components/RegistrationModal.jsx';
import AcolhimentosSection from '../../components/AcolhimentosSection.jsx';
import InformativosSection from '../../components/InformativosSection.jsx';
import FaqSection from '../../components/FaqSection.jsx';
import HortaRequestModal from '../../components/HortaRequestModal.jsx'; // LÓGICA NOVA

import api from '../../services/api.js';
import { medicinalPlantsData, recipesData, rpaData } from '../../constants/pancsData.js';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import apoioHortasImg from '../../assets/images/apoio-hortas.jpg'; 
import cursosOficinasImg from '../../assets/images/cursos-oficinas.jpg';
import novidadesImg from '../../assets/images/novidades.jpg';

import adrianaImg from '../../assets/images/adrianafigueira.jpg';
import fallbackImage from '../../assets/images/FolhinSemImagem.png';

const PLACEHOLDER_FILENAME_FROM_BACKEND = "folhin.png";
const COURSE_BANNER_UPLOAD_PATH_SEGMENT = "banners";
const BACKEND_IMAGE_BASE_URL = api.defaults.baseURL.replace('/api', '');
const SERVER_COURSE_PLACEHOLDER_URL = `${BACKEND_IMAGE_BASE_URL}/uploads/${COURSE_BANNER_UPLOAD_PATH_SEGMENT}/${PLACEHOLDER_FILENAME_FROM_BACKEND}`;

export default function Home() {
  const [seauCourses, setSeauCourses] = useState([]);
  const [externalCourses, setExternalCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isRegistrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [isHortaModalOpen, setIsHortaModalOpen] = useState(false); // LÓGICA NOVA
  const [isAccessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false);
  const [baseFontSize, setBaseFontSize] = useState(12.5);
  const [isDarkMode, setDarkMode] = useState(false);
  const [isTtsEnabled, setTtsEnabled] = useState(false);
  const [activePlantTab, setActivePlantTab] = useState('manjericao');
  const [areRecipesOpen, setAreRecipesOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/cursos');
        const activeCourses = response.data.filter(course => course.ativo);
        
        setSeauCourses(activeCourses.filter(c => c.instituicao === 'SEAU'));
        setExternalCourses(activeCourses.filter(c => c.instituicao !== 'SEAU'));
        setError(null);
      } catch (err) {
        console.error("Erro detalhado ao buscar cursos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${baseFontSize}px`;
  }, [baseFontSize]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);
  
  const handleOpenRegistrationModal = (course) => {
    setSelectedCourse(course);
    setRegistrationModalOpen(true);
  };

  const handleCloseRegistrationModal = () => {
    setRegistrationModalOpen(false);
    setSelectedCourse(null);
  };

  const handleTtsMouseOver = useCallback((event) => {
    if (!isTtsEnabled) return;
    const target = event.target;
    const readableTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'LI', 'BUTTON', 'SUMMARY', 'SPAN', 'DIV'];
    let textToSpeak = target.innerText || target.alt || target.title;

    if (!textToSpeak && target.children.length > 0) {
        for (let child of target.children) {
            if (child.innerText) {
                textToSpeak = child.innerText;
                break;
            }
        }
    }
    
    if (readableTags.includes(target.tagName) && textToSpeak && textToSpeak.trim().length > 0) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  }, [isTtsEnabled]);

  useEffect(() => {
    document.addEventListener('mouseover', handleTtsMouseOver);
    return () => {
      document.removeEventListener('mouseover', handleTtsMouseOver);
      window.speechSynthesis.cancel();
    };
  }, [handleTtsMouseOver]);

  const handleNavClick = (event, targetId) => {
    event.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      window.history.pushState(null, '', `/${targetId}`);
    }
  };

  const serviceCards = [
    {
      img: apoioHortasImg,
      alt: 'Pessoas trabalhando em canteiros de uma horta comunitária',
      title: 'Apoio Para Hortas',
      text: 'Solicite apoio técnico para iniciar ou manter sua horta comunitária.',
      targetId: '#acolhimentos'
    },
    {
      img: cursosOficinasImg,
      alt: 'Alface verde e viçosa crescendo em uma horta',
      title: 'Cursos e Oficinas',
      text: 'Conheça nossos cursos e oficinas sobre agroecologia e cultivo urbano.',
      targetId: '#cursos'
    },
    {
      img: novidadesImg,
      alt: 'Pessoas sentadas em uma sala de aula assistindo a uma apresentação',
      title: 'Novidades',
      text: 'Atualize-se com nossas novidades e práticas em agroecologia.',
      targetId: '#informativos'
    }
  ];

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };
  
  const fontHandlers = {
    increase: () => setBaseFontSize(size => Math.min(size + 2, 24)),
    decrease: () => setBaseFontSize(size => Math.max(size - 2, 12)),
  };

  const darkModeHandler = {
    toggle: () => setDarkMode(prev => !prev),
    isDarkMode,
  };

  const ttsHandler = {
    toggle: () => setTtsEnabled(prev => !prev),
    isTtsEnabled,
  };

  const getCourseImageUrl = (fotoBannerName) => {
    if (fotoBannerName) {
      return `${BACKEND_IMAGE_BASE_URL}/uploads/${COURSE_BANNER_UPLOAD_PATH_SEGMENT}/${fotoBannerName}`;
    }
    return SERVER_COURSE_PLACEHOLDER_URL; 
  };

  const renderCourseSlider = (courses, title) => (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-[#1D3557] mb-6 text-center">{title}</h2>
      {courses.length > 0 ? (
        <Slider {...sliderSettings}>
          {courses.map((course) => (
            <div key={course.idCurso || course.nome} className="px-3">
              <div className="group flex h-96 flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300">
                <img 
                  src={getCourseImageUrl(course.fotoBanner)} 
                  alt={`Banner do curso ${course.nome}`} 
                  className="h-40 w-full object-cover"
                  onError={(e) => {
                    if (e.target.src !== SERVER_COURSE_PLACEHOLDER_URL) {
                      e.target.src = SERVER_COURSE_PLACEHOLDER_URL;
                    } else if (e.target.src !== fallbackImage) {
                      e.target.src = fallbackImage;
                    }
                  }}
                />
                <div className="flex flex-1 flex-col bg-[#e7eff6] justify-between p-4">
                  <h3 className="text-lg font-bold text-[#1D3557]">{course.nome}</h3>
                  <p className="text-sm text-gray-600 flex-1">{course.instituicao}</p>
                  <button onClick={() => setSelectedCourse(course)} className="mt-2 self-center rounded-full bg-[#F4D35E] px-4 py-1.5 font-bold text-sm text-[#1D3557] transition-colors duration-300 group-hover:bg-[#FFE46B]">Ver Detalhes</button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-center text-gray-600">Nenhum curso disponível no momento.</p>
      )}
    </div>
  );

  return (
    <div className="font-sans bg-[#F9FAFB] text-[#1D3557]">
      <Header 
        isMenuOpen={isAccessibilityMenuOpen}
        onMenuToggle={() => setAccessibilityMenuOpen(prev => !prev)}
        accessibilityHandlers={{ fontHandlers, darkModeHandler, ttsHandler }}
        onNavClick={handleNavClick}
      />
      
      <main className="mx-auto max-w-7xl px-4 space-y-12 md:space-y-16 my-8">
        
        <div className="text-center py-3">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1D3557]">Bem-vindo ao Portal Flor da Cidade</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Sua plataforma completa para a agricultura urbana no Recife. Explore nossos serviços, cursos e novidades para cultivar um futuro mais verde e sustentável.</p>
        </div>

        <div className="relative z-10 bg-white py-12 md:py-16 rounded-3xl shadow-lg px-4 md:px-8">
          <h2 className="text-4xl font-extrabold text-center text-[#1D3557] mb-10">Nossos Serviços</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCards.map((card, i) => (
              <div key={i} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <img src={card.img} alt={card.alt} className="h-48 w-full object-cover" />
                <div className="flex flex-1 flex-col bg-[#e7eff6] justify-between p-5">
                  <div>
                    <h3 className="text-xl font-bold text-[#1D3557] mb-2">{card.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{card.text}</p>
                  </div>
                  <a 
                    href={card.targetId} 
                    onClick={(e) => handleNavClick(e, card.targetId)}
                    className="self-start rounded-full bg-[#F4D35E] px-5 py-2 font-bold text-sm text-[#1D3557] transition-colors duration-300 group-hover:bg-[#FFE46B]"
                  >
                    Saiba mais
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* LÓGICA NOVA: Passa a função para o componente AcolhimentosSection */}
        <AcolhimentosSection onSolicitarClick={() => setIsHortaModalOpen(true)} />

        <div id="cursos" className="relative z-10 bg-white py-12 md:py-16 rounded-3xl shadow-lg px-4 md:px-8">
          {loading && <p className="text-center text-lg">Carregando cursos...</p>}
          {error && <p className="text-center text-red-600 font-bold">{error}</p>}
          {!loading && !error && (
            <div className='space-y-12'>
              {renderCourseSlider(seauCourses, "Nossos Cursos SEAU")}
              {renderCourseSlider(externalCourses, "Cursos de Parceiros")}
            </div>
          )}
        </div>

        <InformativosSection />

        <div id="pancs" className="relative z-10 bg-white py-12 md:py-16 rounded-3xl shadow-lg px-4 md:px-8">
          <h2 className="text-4xl font-extrabold text-center text-[#1D3557] mb-12">PANCs e suas Receitas</h2>
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center">
              <p className="text-lg text-gray-700 max-w-4xl mx-auto mb-4">
                As Plantas Alimentícias Não Convencionais (PANCs) são espécies com potencial alimentício, mas pouco consumidas. Junto a elas, as plantas medicinais, usadas por nossos ancestrais, continuam a ser um recurso valioso para a saúde e bem-estar.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-center text-[#1D3557] mb-8">Conheça algumas Plantas Medicinais</h3>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {Object.keys(medicinalPlantsData).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActivePlantTab(key)}
                    className={`px-4 py-2 text-sm md:text-base font-semibold rounded-t-lg transition-colors duration-300 ${activePlantTab === key ? 'bg-[#F4D35E] text-[#1D3557]' : 'bg-white/50 hover:bg-white/80'}`}
                  >
                    {medicinalPlantsData[key].title}
                  </button>
                ))}
              </div>
              <div className="bg-white p-6 rounded-b-lg rounded-tr-lg shadow-lg">
                <h4 className="text-xl font-bold text-[#1D3557] mb-2">{medicinalPlantsData[activePlantTab].title}</h4>
                <p className="text-gray-700 text-justify">{medicinalPlantsData[activePlantTab].content}</p>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-center text-[#1D3557] mb-8">Receitas com PANCs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipesData.map((recipe, index) => (
                  <details key={index} open={areRecipesOpen} className="bg-white p-6 rounded-lg shadow-lg flex flex-col h-full">
                    <summary 
                      className="font-semibold text-lg text-[#1D3557] list-none flex justify-between items-center cursor-pointer"
                      onClick={(e) => { e.preventDefault(); setAreRecipesOpen(prev => !prev); }}
                    >
                      {recipe.title}
                      <FaChevronDown className={`transform transition-transform duration-300 ${areRecipesOpen ? 'rotate-180' : ''}`} />
                    </summary>
                    <div className="mt-4 text-gray-600 space-y-3 text-sm">
                      {recipe.sections.map((section, sIndex) => (
                        <div key={sIndex}>
                          {section.heading && <p className="font-bold">{section.heading}</p>}
                          {section.items && <ul className="list-disc pl-5 space-y-1">{section.items.map((item, iIndex) => <li key={iIndex}>{item}</li>)}</ul>}
                          {section.text && <p className="text-justify whitespace-pre-line">{section.text}</p>}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div>
                <h3 className="text-3xl font-bold text-center text-[#1D3557] mb-8">PANCs por Região do Recife</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rpaData.map((rpa, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                            <h4 className="font-semibold text-lg text-[#1D3557] mb-2">{rpa.title}</h4>
                            <p className="text-gray-600 text-sm">{rpa.content}</p>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        <div id="contato" className="relative z-10 bg-white py-12 md:py-16 rounded-3xl shadow-lg px-4 md:px-8">
          <div className="md:flex md:items-start md:gap-12">
            <div className="text-center md:text-left flex-shrink-0"><img src={adrianaImg} alt="Retrato de Adriana Figueira" className="w-48 h-48 object-cover rounded-full mx-auto mb-6 shadow-lg" /><h2 className="text-3xl font-bold text-[#1D3557]">Adriana Figueira</h2><p className="text-lg text-[#F4D35E] font-semibold">Secretária Executiva</p></div>
            <div className="mt-6 md:mt-0"><p className="text-justify mb-4 text-gray-700">Graduada em Arquitetura e Urbanismo pela UFPE (1983), com mestrado em Desenvolvimento Urbano (2000), atua na Urb Recife desde 1986. Hoje, como Secretária Executiva de Agricultura Urbana, lidera a missão de fomentar práticas sustentáveis.</p><div className="border-t pt-6 mt-6"><h3 className="text-2xl font-bold text-[#1D3557] mb-4">Contato SEAU</h3><div className="space-y-2 text-gray-700"><p><span className="font-semibold text-[#1D3557]">Endereço:</span> Prefeitura do Recife - Av. Cais do Apolo, 925, 5º andar, Recife/PE</p><p><span className="font-semibold text-[#1D3557]">Telefone:</span> (81) 3355-8606</p><p><span className="font-semibold text-[#1D3557]">E-mail:</span> agriculturaurbana@recife.pe.gov.br</p></div></div></div>
          </div>
        </div>
        
        <FaqSection />

      </main>

      <Footer />
      
      {/* SEÇÃO DE MODAIS */}
      {selectedCourse && !isRegistrationModalOpen && (
        <CourseModal 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)}
          onInscricaoClick={() => handleOpenRegistrationModal(selectedCourse)}
        />
      )}

      {isRegistrationModalOpen && (
        <RegistrationModal
          course={selectedCourse}
          onClose={handleCloseRegistrationModal}
        />
      )}
      
      {/* LÓGICA NOVA: Renderização do modal de solicitação de horta */}
      {isHortaModalOpen && <HortaRequestModal onClose={() => setIsHortaModalOpen(false)} />}
    </div>
  );
}