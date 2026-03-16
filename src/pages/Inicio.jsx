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
                    <img src="/imagem/Interior 1.png" alt="Interior 1" />
                    <img src="/imagem/Interior 2.png" alt="Interior 2" />
                    <img src="/imagem/Interior 3.png" alt="Interior 3" />
                    <img src="/imagem/Interior 4.png" alt="Interior 4" />
                </div>
            </section>

            {/* NOSSOS SERVIÇOS */}
            <section id="servicos" className="secao-servicos">
                <h2>NOSSOS SERVIÇOS</h2>
                <div className="grid-servicos">
                    <div className="card-servico">
                        <img src="/imagem/cilios.png" alt="Cílios" />
                        <span>CÍLIOS</span>
                    </div>
                    <div className="card-servico">
                        <img src="/imagem/unhas.png" alt="Unhas" />
                        <span>UNHAS</span>
                    </div>
                    <div className="card-servico">
                        <img src="/imagem/sobrancelha.png" alt="Sobrancelha" />
                        <span>SOBRANCELHA</span>
                    </div>
                    <div className="card-servico">
                        <img src="/imagem/boca.png" alt="Lip Blush" />
                        <span>LIP BLUSH</span>
                    </div>
                    <div className="card-servico">
                        <img src="/imagem/maquiagem.png" alt="Maquiagem" />
                        <span>MAQUIAGEM</span>

                        {/* RODAPÉ */}
                        <footer id="contato" className="footer">
                            <div className="footer-info">
                                <h4>SEVEN CLINIC</h4>
                                <p>Telefone</p>
                                <p>(41) 98902-8503</p>
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
                </div>
            </section>
        </div>
    );
}


export default Inicio;