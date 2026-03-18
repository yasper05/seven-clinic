import React from 'react';
import { useNavigate } from 'react-router-dom';

function Inicio() {
    const navigate = useNavigate();

    return (
        <div className="inicio-container">
            {/* NAVBAR */}
            <nav className="navbar">
                <div className="logo">SEVEN <span className="logo-sub">CLINIC</span></div>
                <div className="menu-links">
                    <a href="#sobre">Sobre</a>
                    <a href="#galeria">O Espaço</a>
                    <a href="#servicos">Serviços</a>
                    <a href="#contato">Contato</a>
                    <button className="btn-agendar" onClick={() => navigate('/login')}>AGENDAR</button>
                </div>
            </nav>

            {/* O ESPAÇO */}
            <header className="hero">
                <div className="hero-content">
                    <h1>SEVEN <span className="hero-sub">CLINIC</span></h1>
                    <button className="btn-hero" onClick={() => navigate('/login')}>AGENDAR HORÁRIO</button>
                </div>
            </header>
            <section id="sobre" className="secao-espaco">
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
                    <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80" alt="Interior 1" />
                    <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80" alt="Interior 2" />
                    <img src="https://images.unsplash.com/photo-1470259078422-826894b933aa?w=400&q=80" alt="Interior 3" />
                    <img src="https://images.unsplash.com/photo-1600948836101-059a1a8b4f13?w=400&q=80" alt="Interior 4" />
                </div>
            </section>

            {/* NOSSOS SERVIÇOS */}
            <section id="servicos" className="secao-servicos">
                <h2>NOSSOS SERVIÇOS</h2>
                <div className="grid-servicos">
                    <div className="card-servico">
                        <img src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80" alt="Cílios" />
                        <span>CÍLIOS</span>
                    </div>
                    <div className="card-servico">
                        <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80" alt="Unhas" />
                        <span>UNHAS</span>
                    </div>
                    <div className="card-servico">
                        <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80" alt="Sobrancelha" />
                        <span>SOBRANCELHA</span>
                    </div>
                    <div className="card-servico">
                        <img src="https://images.unsplash.com/photo-1588776814546-1ffbb542d814?w=600&q=80" alt="Lip Blush" />
                        <span>LIP BLUSH</span>
                    </div>
                    <div className="card-servico">
                        <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80" alt="Maquiagem" />
                        <span>MAQUIAGEM</span>
                    </div>
                </div>
            </section>

            {/* RODAPÉ */}
            <footer id="contato" className="footer">
                <div className="footer-info">
                    <h4>SEVEN CLINIC</h4>
                    <p>Telefone</p>
                    <p>(41) 98902-8503</p>
                    <a href="https://www.instagram.com/sevencuritiba?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none', marginTop: '15px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
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
        </div>
    );
}


export default Inicio;