import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const imagensAmbiente = [
    "/imagem/ambiente/WhatsApp Image 2026-06-09 at 11.54.344.jpeg",
    "/imagem/ambiente/IMG_9889.PNG",
    "/imagem/ambiente/49B197F0-A329-4667-8EF4-38244CB0912B.PNG",
    "/imagem/ambiente/68087495-B390-4696-AAF4-C2605219DF56.PNG",
    "/imagem/ambiente/IMG_1265.PNG"
];

const imagensPortfolio = [
    { src: "/imagem/IMG_7046.JPG.jpeg", label: "Cílios" },
    { src: "/imagem/IMG_7078.JPG.jpeg", label: "Cílios" },
    { src: "/imagem/cilios3.png", label: "Cílios" },
    { src: "/imagem/cilios4.png", label: "Cílios" },
    { src: "/imagem/IMG_5774.JPG.jpeg", label: "Sobrancelha" },
    { src: "/imagem/bronw.png", label: "Sobrancelha" },
    { src: "/imagem/bronw2.png", label: "Sobrancelha" },
    { src: "/imagem/IMG_3175.PNG", label: "Sobrancelha" },
    { src: "/imagem/IMG_3862.PNG", label: "Sobrancelha" },
    { src: "/imagem/WhatsApp Image 2026-06-09 at 11.54.33.jpeg", label: "Unhas" },
    { src: "/imagem/WhatsApp Image 2026-06-09 at 11.54.34.jpeg", label: "Unhas" },
    { src: "/imagem/IMG_6812.PNG", label: "Resultados" },
    { src: "/imagem/IMG_6814.PNG", label: "Resultados" },
    { src: "/imagem/IMG_6815.PNG", label: "Resultados" },
    { src: "/imagem/IMG_6816.PNG", label: "Resultados" },
    { src: "/imagem/IMG_6817.PNG", label: "Resultados" },
    { src: "/imagem/IMG_2124.PNG", label: "Resultados" },
    { src: "/imagem/IMG_2126.PNG", label: "Resultados" },
    { src: "/imagem/IMG_2127.PNG", label: "Resultados" },
    { src: "/imagem/IMG_2128.PNG", label: "Resultados" },
    { src: "/imagem/IMG_2129.PNG", label: "Resultados" },
    { src: "/imagem/IMG_4115.PNG", label: "Resultados" },
    { src: "/imagem/IMG_4102.PNG", label: "Resultados" },
    { src: "/imagem/boca2.png", label: "Lip Blush" },
    { src: "/imagem/boca.png", label: "Lip Blush" },
    { src: "/imagem/maquiagem.png", label: "Maquiagem" },
    { src: "/imagem/WhatsApp Image 2026-06-10 at 10.13.30.jpeg", label: "Resultados" },
    { src: "/imagem/WhatsApp Image 2026-06-10 at 10.13.31.jpeg", label: "Resultados" },
    { src: "/imagem/WhatsApp Image 2026-06-10 at 10.13.31 (1).jpeg", label: "Resultados" },
    { src: "/imagem/WhatsApp Image 2026-06-10 at 10.13.31 (2).jpeg", label: "Resultados" },
    { src: "/imagem/WhatsApp Image 2026-06-10 at 10.13.31 (3).jpeg", label: "Resultados" },
    { src: "/imagem/WhatsApp Image 2026-06-10 at 10.13.32.jpeg", label: "Resultados" },
    { src: "/imagem/WhatsApp Image 2026-06-10 at 10.13.32 (1).jpeg", label: "Resultados" },
];

function Inicio() {
    const navigate = useNavigate();

    // Estado lightbox ambiente
    const [activeImageIndex, setActiveImageIndex] = useState(null);
    const [menuAberto, setMenuAberto] = useState(false);

    // Estado portfólio
    const [portfolioAberto, setPortfolioAberto] = useState(false);
    const [portfolioIndex, setPortfolioIndex] = useState(0);

    const fecharLightbox = () => setActiveImageIndex(null);
    const fecharPortfolio = () => { setPortfolioAberto(false); setPortfolioIndex(0); };
    const abrirPortfolio = (index = 0) => { setPortfolioAberto(true); setPortfolioIndex(index); };

    const irParaAnterior = () => {
        setActiveImageIndex(prev => prev === 0 ? imagensAmbiente.length - 1 : prev - 1);
    };
    const irParaProxima = () => {
        setActiveImageIndex(prev => prev === imagensAmbiente.length - 1 ? 0 : prev + 1);
    };
    const portfolioAnterior = () => {
        setPortfolioIndex(prev => prev === 0 ? imagensPortfolio.length - 1 : prev - 1);
    };
    const portfolioProxima = () => {
        setPortfolioIndex(prev => prev === imagensPortfolio.length - 1 ? 0 : prev + 1);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (activeImageIndex !== null) {
                if (e.key === 'Escape') fecharLightbox();
                if (e.key === 'ArrowLeft') irParaAnterior();
                if (e.key === 'ArrowRight') irParaProxima();
            } else if (portfolioAberto) {
                if (e.key === 'Escape') fecharPortfolio();
                if (e.key === 'ArrowLeft') portfolioAnterior();
                if (e.key === 'ArrowRight') portfolioProxima();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeImageIndex, portfolioAberto, portfolioIndex]);

    return (
        <div className="inicio-container">
            {/* NAVBAR */}
            <nav className="navbar">
                <div className="logo"><span className="logo-main">SEVEN</span><span className="logo-sub">CLINIC</span></div>
                <button className="menu-hamburger" onClick={() => setMenuAberto(!menuAberto)} aria-label="Menu">
                    <span className={menuAberto ? 'ham-line open' : 'ham-line'}></span>
                    <span className={menuAberto ? 'ham-line open' : 'ham-line'}></span>
                    <span className={menuAberto ? 'ham-line open' : 'ham-line'}></span>
                </button>
                <div className={`menu-links ${menuAberto ? 'menu-open' : ''}`}>
                    <a href="#sobre" onClick={() => setMenuAberto(false)}>Sobre</a>
                    <a href="#galeria" onClick={() => setMenuAberto(false)}>O Espaço</a>
                    <a href="#servicos" onClick={() => setMenuAberto(false)}>Serviços</a>
                    <a href="#contato" onClick={() => setMenuAberto(false)}>Contato</a>
                    <button className="btn-agendar" onClick={() => { navigate('/login'); setMenuAberto(false); }}>AGENDAR</button>
                </div>
            </nav>

            {/* HERO */}
            <header className="hero">
                <div className="hero-content">
                    <h1>SEVEN <span className="hero-sub">CLINIC</span></h1>
                    <button className="btn-hero" onClick={() => navigate('/login')}>AGENDAR HORÁRIO</button>
                </div>
            </header>

            {/* O ESPAÇO */}
            <section id="sobre" className="secao-espaco">
                <div className="espaco-imagem">
                    <img src="/imagem/E348DDF9-68D1-4E6A-BA3E-A3D973A83F4D.PNG" alt="Espaço Seven Clinic" />
                </div>
                <div className="espaco-texto">
                    <h2>| O ESPAÇO</h2>
                    <p>O <strong>SEVEN CLINIC</strong> é mais do que um salão, é o seu refúgio. Localizado no coração de Curitiba, oferecemos uma experiência de terapia e beleza integrada.</p>
                    <p>Nossa equipe está sempre acompanhando as últimas tendências para trazer inovação, conforto e aquele momento de silêncio que você merece.</p>
                </div>
            </section>

            {/* NOSSO AMBIENTE */}
            <section id="galeria" className="secao-ambiente">
                <h2>NOSSO AMBIENTE</h2>
                <div className="galeria-ambiente">
                    {imagensAmbiente.map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt={`Interior ${index + 1}`}
                            onClick={() => setActiveImageIndex(index)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </div>
            </section>

            {/* NOSSOS SERVIÇOS */}
            <section id="servicos" className="secao-servicos">
                <h2>NOSSOS SERVIÇOS</h2>
                <div className="grid-servicos">
                    <div className="card-servico">
                        <img src="/imagem/IMG_7046.JPG.jpeg" alt="Cílios" className="img-cilios" />
                        <span>CÍLIOS</span>
                    </div>
                    <div className="card-servico">
                        <img src="/imagem/WhatsApp Image 2026-06-09 at 11.54.33.jpeg" alt="Unhas" />
                        <span>UNHAS</span>
                    </div>
                    <div className="card-servico">
                        <img src="/imagem/IMG_5774.JPG.jpeg" alt="Sobrancelha" className="img-sobrancelha" />
                        <span>SOBRANCELHA</span>
                    </div>
                    <div className="card-servico">
                        <img src="/imagem/boca2.png" alt="Lip Blush" />
                        <span>LIP BLUSH</span>
                    </div>
                    <div className="card-servico">
                        <img src="/imagem/maquiagem.png" alt="Maquiagem" />
                        <span>MAQUIAGEM</span>
                    </div>
                </div>

                {/* BOTÃO VER MAIS RESULTADOS */}
                <button className="btn-ver-mais" onClick={() => abrirPortfolio(0)}>
                    VER MAIS RESULTADOS
                </button>
            </section>

            {/* RODAPÉ */}
            <footer id="contato" className="footer">
                <div className="footer-info">
                    <h4>SEVEN CLINIC</h4>
                    <p>Telefone</p>
                    <p>
                        <a href="https://wa.me/5541989028503?utm_source=ig&utm_medium=social&utm_content=link_in_bio" target="_blank" rel="noopener noreferrer" className="link-whats">
                            (41) 98902-8503
                        </a>
                    </p>
                    <a href="https://www.instagram.com/sevencuritiba?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none', marginTop: '15px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                        </svg>
                        Siga nosso Instagram
                    </a>
                </div>
                <div className="footer-info">
                    <h4>LOCALIZAÇÃO</h4>
                    <p>Avenida Cândido de Abreu, 427 - Centro Cívico</p>
                    <p>Curitiba - PR</p>
                    <a href="https://maps.google.com/?q=Avenida+Cândido+de+Abreu,427+Curitiba" target="_blank" rel="noopener noreferrer" className="btn-mapa">VER NO MAPA</a>
                </div>
                <div className="footer-info">
                    <h4>HORÁRIOS</h4>
                    <p>Seg - Sáb: 08:00 - 19:00</p>
                    <p>Dom: fechada</p>
                </div>
            </footer>

            {/* LIGHTBOX AMBIENTE */}
            {activeImageIndex !== null && (
                <div className="lightbox-overlay" onClick={fecharLightbox}>
                    <button className="lightbox-close" onClick={fecharLightbox}>&times;</button>
                    <button className="lightbox-arrow lightbox-prev" onClick={e => { e.stopPropagation(); irParaAnterior(); }}>&#10094;</button>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <img src={imagensAmbiente[activeImageIndex]} alt={`Ambiente ${activeImageIndex + 1}`} />
                    </div>
                    <button className="lightbox-arrow lightbox-next" onClick={e => { e.stopPropagation(); irParaProxima(); }}>&#10095;</button>
                </div>
            )}

            {/* MODAL PORTFÓLIO */}
            {portfolioAberto && (
                <div className="portfolio-overlay" onClick={fecharPortfolio}>
                    <div className="portfolio-modal" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="portfolio-header">
                            <h3 className="portfolio-title">PORTFÓLIO DE RESULTADOS</h3>
                            <button className="portfolio-close" onClick={fecharPortfolio}>&times;</button>
                        </div>

                        {/* Imagem principal */}
                        <div className="portfolio-destaque">
                            <button className="portfolio-arrow prev" onClick={portfolioAnterior}>&#10094;</button>
                            <div className="portfolio-img-wrap">
                                <img
                                    key={portfolioIndex}
                                    src={imagensPortfolio[portfolioIndex].src}
                                    alt={`Resultado ${portfolioIndex + 1}`}
                                    className="portfolio-img-destaque"
                                />
                            </div>
                            <button className="portfolio-arrow next" onClick={portfolioProxima}>&#10095;</button>
                        </div>

                        {/* Contador e miniaturas */}
                        <div className="portfolio-footer-info">
                            <span className="portfolio-contador">
                                {portfolioIndex + 1} / {imagensPortfolio.length}
                            </span>
                        </div>
                        <div className="portfolio-thumbs">
                            {imagensPortfolio.map((img, i) => (
                                <img
                                    key={i}
                                    src={img.src}
                                    alt={`Resultado ${i + 1}`}
                                    className={`portfolio-thumb ${i === portfolioIndex ? 'ativa' : ''}`}
                                    onClick={() => setPortfolioIndex(i)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inicio;