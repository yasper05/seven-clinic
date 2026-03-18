import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PoliticaPrivacidade = () => {
    const navigate = useNavigate();

    return (
        <div style={{minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter', 'Segoe UI', sans-serif"}}>
            {/* Header */}
            <header style={{background: '#1a1a1a', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <h1 style={{color: '#fff', fontSize: '1.2rem', fontWeight: '600', margin: 0}}>
                    SEVEN <span style={{color: '#c9a99a'}}>CLINIC</span>
                </h1>
                <button
                    onClick={() => navigate(-1)}
                    style={{background: 'none', border: '1px solid #555', color: '#ddd', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer', fontSize: '0.85rem'}}
                >
                    ← Voltar
                </button>
            </header>

            {/* Content */}
            <main style={{maxWidth: '760px', margin: '0 auto', padding: '48px 24px'}}>
                <h1 style={{fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px'}}>
                    Política de Privacidade
                </h1>
                <p style={{color: '#888', fontSize: '0.9rem', marginBottom: '40px'}}>
                    Última atualização: março de 2026 · Versão 1.0
                </p>

                <div style={{lineHeight: '1.8', color: '#333', fontSize: '0.95rem'}}>

                    <section style={{marginBottom: '32px'}}>
                        <h2 style={{fontSize: '1.15rem', fontWeight: '600', color: '#1a1a1a', borderBottom: '2px solid #f0e6e3', paddingBottom: '8px', marginBottom: '12px'}}>
                            1. Quem somos
                        </h2>
                        <p>
                            A <strong>Seven Clinic</strong> é um sistema de agendamento de serviços de estética. Nesta política, explicamos de forma clara e transparente como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
                        </p>
                    </section>

                    <section style={{marginBottom: '32px'}}>
                        <h2 style={{fontSize: '1.15rem', fontWeight: '600', color: '#1a1a1a', borderBottom: '2px solid #f0e6e3', paddingBottom: '8px', marginBottom: '12px'}}>
                            2. Dados que coletamos
                        </h2>
                        <p>Para oferecer nossos serviços, coletamos os seguintes dados pessoais:</p>
                        <ul style={{paddingLeft: '20px', marginTop: '8px'}}>
                            <li><strong>Nome completo</strong> — para identificação.</li>
                            <li><strong>Endereço de e-mail</strong> — para login, verificação de conta e comunicações.</li>
                            <li><strong>Número de telefone (celular)</strong> — para envio de lembretes de agendamento via WhatsApp.</li>
                            <li><strong>Informações de agendamento</strong> — data, horário e serviço escolhido.</li>
                        </ul>
                        <p style={{marginTop: '12px'}}>
                            <strong>Não coletamos</strong> dados de pagamento, documentos de identidade ou qualquer dado sensível (art. 5º, II, LGPD).
                        </p>
                    </section>

                    <section style={{marginBottom: '32px'}}>
                        <h2 style={{fontSize: '1.15rem', fontWeight: '600', color: '#1a1a1a', borderBottom: '2px solid #f0e6e3', paddingBottom: '8px', marginBottom: '12px'}}>
                            3. Como usamos seus dados
                        </h2>
                        <p>Seus dados são utilizados exclusivamente para:</p>
                        <ul style={{paddingLeft: '20px', marginTop: '8px'}}>
                            <li>Criar e gerenciar sua conta na plataforma.</li>
                            <li>Realizar o agendamento de serviços.</li>
                            <li>Enviar lembretes automáticos via <strong>WhatsApp</strong> no dia anterior e no dia do seu agendamento.</li>
                            <li>Enviar e-mails transacionais: verificação de conta e recuperação de senha.</li>
                        </ul>
                    </section>

                    <section style={{marginBottom: '32px'}}>
                        <h2 style={{fontSize: '1.15rem', fontWeight: '600', color: '#1a1a1a', borderBottom: '2px solid #f0e6e3', paddingBottom: '8px', marginBottom: '12px'}}>
                            4. Compartilhamento de dados
                        </h2>
                        <p>Seus dados <strong>não são vendidos</strong> nem compartilhados com terceiros para fins comerciais. Utilizamos apenas:</p>
                        <ul style={{paddingLeft: '20px', marginTop: '8px'}}>
                            <li><strong>Gmail (Google)</strong> — para envio de e-mails transacionais.</li>
                            <li><strong>WhatsApp (Meta)</strong> — para envio de lembretes de agendamento.</li>
                        </ul>
                        <p style={{marginTop: '12px'}}>Esses serviços possuem suas próprias políticas de privacidade.</p>
                    </section>

                    <section style={{marginBottom: '32px'}}>
                        <h2 style={{fontSize: '1.15rem', fontWeight: '600', color: '#1a1a1a', borderBottom: '2px solid #f0e6e3', paddingBottom: '8px', marginBottom: '12px'}}>
                            5. Segurança dos dados
                        </h2>
                        <p>Adotamos medidas técnicas de segurança, incluindo:</p>
                        <ul style={{paddingLeft: '20px', marginTop: '8px'}}>
                            <li>Senhas armazenadas com <strong>hash bcrypt</strong> (nunca em texto simples).</li>
                            <li>Autenticação via <strong>JWT (tokens de acesso com validade limitada)</strong>.</li>
                            <li>Verificação de e-mail com código de 6 dígitos no cadastro.</li>
                            <li>Tokens de recuperação de senha com expiração de 1 hora.</li>
                        </ul>
                    </section>

                    <section style={{marginBottom: '32px'}}>
                        <h2 style={{fontSize: '1.15rem', fontWeight: '600', color: '#1a1a1a', borderBottom: '2px solid #f0e6e3', paddingBottom: '8px', marginBottom: '12px'}}>
                            6. Seus direitos (LGPD - Art. 18)
                        </h2>
                        <p>Como titular dos seus dados, você tem os seguintes direitos:</p>
                        <ul style={{paddingLeft: '20px', marginTop: '8px'}}>
                            <li>✅ <strong>Acesso</strong> — saber quais dados possuímos sobre você.</li>
                            <li>✅ <strong>Correção</strong> — atualizar dados incorretos no seu perfil.</li>
                            <li>✅ <strong>Exclusão</strong> — solicitar a remoção completa dos seus dados ("direito ao esquecimento"), disponível na página de Perfil.</li>
                            <li>✅ <strong>Portabilidade</strong> — solicitar seus dados em formato estruturado.</li>
                            <li>✅ <strong>Revogação do consentimento</strong> — a qualquer momento, sem prejuízo.</li>
                        </ul>
                        <p style={{marginTop: '12px'}}>
                            Para exercer qualquer direito, acesse seu <strong>Perfil</strong> na plataforma ou entre em contato conosco pelo e-mail: <strong>sevenclinic.suporte@gmail.com</strong>.
                        </p>
                    </section>

                    <section style={{marginBottom: '32px'}}>
                        <h2 style={{fontSize: '1.15rem', fontWeight: '600', color: '#1a1a1a', borderBottom: '2px solid #f0e6e3', paddingBottom: '8px', marginBottom: '12px'}}>
                            7. Retenção de dados
                        </h2>
                        <p>
                            Seus dados são mantidos enquanto sua conta estiver ativa. Ao excluir sua conta, todos os seus dados pessoais são removidos permanentemente dos nossos sistemas.
                        </p>
                    </section>

                    <section style={{marginBottom: '32px'}}>
                        <h2 style={{fontSize: '1.15rem', fontWeight: '600', color: '#1a1a1a', borderBottom: '2px solid #f0e6e3', paddingBottom: '8px', marginBottom: '12px'}}>
                            8. Contato
                        </h2>
                        <p>
                            Dúvidas sobre esta política? Entre em contato:{' '}
                            <a href="mailto:sevenclinic.suporte@gmail.com" style={{color: '#654b42'}}>
                                sevenclinic.suporte@gmail.com
                            </a>
                        </p>
                    </section>

                </div>

                <div style={{marginTop: '48px', textAlign: 'center'}}>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-primary"
                        style={{width: 'auto', padding: '12px 32px'}}
                    >
                        Voltar ao Cadastro
                    </button>
                </div>
            </main>
        </div>
    );
};

export default PoliticaPrivacidade;
