import React from 'react';

// --- ARQUIVOS DE MÍDIA ---
import videoSeau from '../assets/videos/Video_seau.mp4';
// Usando uma imagem que já existe no seu projeto como placeholder.
// Substitua por uma imagem real quando tiver uma.
import folhinImg from '../assets/images/folhin.png'; 

// --- DADOS DOS INFORMATIVOS ---
const informativosData = [
  {
    id: 1,
    type: 'video',
    mediaSrc: videoSeau,
    title: 'Dia Mundial da Abelha',
    description: [
      'Já parou para refletir sobre a importância daquele pequeno zumbido que ecoa pela natureza? No Dia da Abelha, convidamos você a mergulhar no fascinante mundo desses seres incríveis.',
      'Responsáveis pela polinização, elas garantem a reprodução das plantas e a diversidade dos alimentos que chegam à nossa mesa. Em sistemas agroecológicos, sua presença é um sinal claro de equilíbrio e saúde ambiental.',
      'Compreender o papel das abelhas é fundamental para repensarmos nossos hábitos e assumirmos o compromisso com a preservação da vida. Cuidar delas é cuidar de nós mesmos e do futuro do planeta.'
    ],
    linkUrl: 'https://www.youtube.com',
    linkText: 'Ver no YouTube'
  },
  {
    id: 2,
    type: 'image',
    mediaSrc: folhinImg, 
    title: 'A Arte da Compostagem Doméstica',
    description: [
      'Transforme o que você considera "lixo" em um rico adubo para suas plantas. A compostagem é um processo simples que reduz o desperdício e cria um fertilizante natural e poderoso.',
      'Aprenda a montar sua própria composteira e descubra quais resíduos orgânicos podem ser utilizados. É um passo pequeno com um impacto gigante para um lar mais sustentável.'
    ],
    linkUrl: '#', 
    linkText: 'Ler Mais'
  }
];

// --- SUB-COMPONENTE PARA O CARD ---
const InformativoCard = ({ post }) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      {post.type === 'video' ? (
        <video controls playsInline className="h-56 w-full object-cover">
          <source src={post.mediaSrc} type="video/mp4" />
          Seu navegador não suporta o vídeo.
        </video>
      ) : (
        <img src={post.mediaSrc} alt={post.title} className="h-56 w-full object-cover" />
      )}
      
      <div className="flex flex-1 flex-col justify-between bg-[#e7eff6] p-6">
        <div>
          <h3 className="mb-3 text-xl font-bold text-[#1D3557]">{post.title}</h3>
          <div className="space-y-3 text-gray-600 text-sm text-justify">
            {post.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
        <a 
          href={post.linkUrl} 
          target={post.linkUrl === '#' ? '_self' : '_blank'}
          rel="noopener noreferrer" 
          className="self-start mt-5 rounded-full bg-[#F4D35E] px-5 py-2 font-bold text-sm text-[#1D3557] transition-colors duration-300 hover:bg-[#FFE46B]"
        >
          {post.linkText}
        </a>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DA SEÇÃO ---
export default function InformativosSection() {
  // AJUSTE CRÍTICO: Adicionado o id="informativos" que estava faltando.
  return (
    <div id="informativos" className="relative z-10 bg-white py-12 md:py-16 rounded-3xl shadow-lg px-4 md:px-8">
      <h2 className="text-4xl font-extrabold text-center text-[#1D3557] mb-12">Informativos SEAU</h2>
      
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {informativosData.map(post => (
          <InformativoCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}