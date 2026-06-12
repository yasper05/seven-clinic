export const SERVICOS_POR_PROFISSIONAL = {
    'Laura Alencar': {
        especialidade: 'Cílios',
        categorias: {
            'Cílios': [
                { nome: 'Classico',      preco: 220.0, duracao: 150, permiteManutencao: true  },
                { nome: 'Volume light',  preco: 210.0, duracao: 150, permiteManutencao: true  },
                { nome: 'Soft light',    preco: 175.0, duracao: 120, permiteManutencao: true  },
                { nome: 'wet',           preco: 240.0, duracao: 150, permiteManutencao: true  },
                { nome: 'anime',         preco: 250.0, duracao: 150, permiteManutencao: false },
                { nome: 'soft fox',      preco: 175.0, duracao: 120, permiteManutencao: true  },
                { nome: 'delineado',     preco: 240.0, duracao: 150, permiteManutencao: true  },
                { nome: 'wispy',         preco: 250.0, duracao: 150, permiteManutencao: true  },
                { nome: 'fox eyes',      preco: 230.0, duracao: 150, permiteManutencao: true  },
                { nome: 'cat eyes',      preco: 200.0, duracao: 150, permiteManutencao: true  },
            ]
        }
    },
    'Mayara Vespasiano': {
        especialidade: 'Sobrancelha, Lábios e Depilação',
        categorias: {
            'Sobrancelha': [
                { nome: 'Design personalizado', preco: 45.0,  duracao: 30  },
                { nome: 'Design + coloração',   preco: 79.0,  duracao: 45  },
                { nome: 'Design + henna',       preco: 69.0,  duracao: 45  },
                { nome: 'Light brows',          preco: 120.0, duracao: 75  },
                { nome: 'Brow lamination',      preco: 195.0, duracao: 75  },
                { nome: 'Micropigmentação',     preco: 690.0, duracao: 90  },
            ],
            'Lábios': [
                { nome: 'Lip blush',               preco: 230.0, duracao: 90  },
                { nome: 'Protocolo de hidratação', preco: 120.0, duracao: 45  },
                { nome: 'Microlabial',             preco: 690.0, duracao: 120 },
            ],
            'Adicionais': [
                { nome: 'Buço',            preco: 20.0, duracao: 15 },
                { nome: 'Epilação facial', preco: 70.0, duracao: 45 },
            ]
        }
    },
    'Ana Paula': {
        especialidade: 'Unhas',
        categorias: {
            'Aplicação': [
                { nome: 'Alongamento em Molde F1',   opcoes: { 'Natural': 190.0, 'Decorada': 220.0 }, duracao: 120 },
                { nome: 'Alongamento em Soft Gel',   opcoes: { 'Natural': 130.0, 'Decorada': 160.0 }, duracao: 90  },
                { nome: 'Banho de gel em molde F1',  opcoes: { 'Natural': 90.0,  'Decorada': 120.0 }, duracao: 90  },
                { nome: 'Blindagem estrutural',      opcoes: { 'Natural': 90.0,  'Decorada': 110.0 }, duracao: 60  },
                { nome: 'Banho de gel fiber',        opcoes: { 'Natural': 150.0, 'Decorada': 180.0 }, duracao: 90  },
            ],
            'Manutenção': [
                { nome: 'Manutenção em Molde F1',      opcoes: { 'Natural': 120.0, 'Decorada': 150.0 }, duracao: 90 },
                { nome: 'Manutenção em Soft Gel',      opcoes: { 'Natural': 100.0, 'Decorada': 130.0 }, duracao: 90 },
                { nome: 'Manutenção Blindagem fiber',  opcoes: { 'Natural': 100.0, 'Decorada': 130.0 }, duracao: 90 },
            ],
            'Demais Serviços': [
                { nome: 'Esmaltação em gel (blindagem)',     opcoes: { 'Esmaltada': 80.0, 'Decorada': 100.0 }, duracao: 60 },
                { nome: 'Reconstrução e alinhamento',       preco: 20.0,  duracao: 30 },
                { nome: 'Remoção de alongamento',           preco: 70.0,  duracao: 45 },
                { nome: 'Reposição unha quebrada',          preco: 10.0,  duracao: 20 },
                { nome: 'Remoção de esmaltação',            preco: 40.0,  duracao: 30 },
                { nome: 'Remoção de blindagem',             preco: 60.0,  duracao: 45 },
                { nome: 'Pedicure',                         opcoes: { 'Esmaltada': 80.0, 'Decorada': 100.0 }, duracao: 60 },
                { nome: 'Adicional pedraria',               preco: 10.0,  duracao: 15 },
                { nome: 'Cuticulagem com tesoura',          preco: 20.0,  duracao: 30 },
            ]
        }
    }
};
