import React, { useState, useEffect } from 'react';
import api from '../services/api';
import FakeCaptcha from './FakeCaptcha';

export default function HortaRequestModal({ onClose }) {
    const [tiposHorta, setTiposHorta] = useState([]);
    const [areasClassificacao, setAreasClassificacao] = useState([]);
    const [atividadesProdutivas, setAtividadesProdutivas] = useState([]);
    const [isCaptchaSolved, setIsCaptchaSolved] = useState(false);
    const [captchaResetKey, setCaptchaResetKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        nome: '', email: '', telefone: '', escolaridade: 'SEM_ESCOLARIDADE', funcaoCargo: '',
        idTipoDeHorta: '', endereco: '', tamanhoAreaProducao: '', idAreaClassificacao: '',
        idAtividadesProdutivas: '', qntPessoas: '3', caracteristicaGrupo: '', atividadeDescricao: '',
        parceria: '', imagem: null, isPublica: false, publicoBeneficiario: '', cadunico: '',
        responsavelComunidade: '', parceirosComunitarios: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tiposRes, areasRes, atividadesRes] = await Promise.all([
                    api.get('/hortas/tipo'),
                    api.get('/hortas/areas-classificacao'),
                    api.get('/hortas/atividades-produtivas')
                ]);
                setTiposHorta(tiposRes.data);
                setAreasClassificacao(areasRes.data);
                setAtividadesProdutivas(atividadesRes.data);
            } catch (err) {
                setError("Falha ao carregar as opções do formulário. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
        }));
    };

    const getValidationState = () => {
        const selectedTipo = tiposHorta.find(t => t.idTipoDeHorta == formData.idTipoDeHorta);
        if (!selectedTipo) return { isValid: false, message: 'Selecione um tipo de horta para continuar.' };
        
        const tipoNome = selectedTipo.nome.toLowerCase();
        const isInstitucional = ['escolar', 'saúde', 'institucional'].some(term => tipoNome.includes(term));
        
        if (isInstitucional && !formData.isPublica) {
            return { isValid: false, message: 'Para este tipo, a instituição deve ser pública ou filantrópica.' };
        }
        if (parseInt(formData.qntPessoas, 10) < 3) {
            return { isValid: false, message: 'O grupo deve ter no mínimo 3 participantes.' };
        }
        if (tipoNome.includes('comunitária') && !isCaptchaSolved) {
            return { isValid: false, message: 'Por favor, complete a verificação de segurança (CAPTCHA).' };
        }
        return { isValid: true, message: '' };
    };

    const validation = getValidationState();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validation.isValid) {
            setError(validation.message);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Gerando um CPF e data de nascimento placeholders, já que não são pedidos no formulário.
            const pessoaResponse = await api.post('/pessoas', { nome: formData.nome, email: formData.email, telefone: formData.telefone, cpf: Date.now().toString().slice(-11), dataNascimento: '1990-01-01', escolaridade: formData.escolaridade });
            const usuarioResponse = await api.post('/usuarios', { pessoa: { idPessoa: pessoaResponse.data.idPessoa }, senha: Date.now().toString(), ativo: true });
            
            const hortaData = new FormData();
            hortaData.append('nomeHorta', `Solicitação de ${formData.nome}`);
            hortaData.append('idUsuario', usuarioResponse.data.idUsuario);
            hortaData.append('idTipoDeHorta', formData.idTipoDeHorta);
            hortaData.append('endereco', formData.endereco);
            hortaData.append('tamanhoAreaProducao', formData.tamanhoAreaProducao);
            hortaData.append('idAreaClassificacao', formData.idAreaClassificacao);
            hortaData.append('idAtividadesProdutivas', formData.idAtividadesProdutivas);
            hortaData.append('qntPessoas', formData.qntPessoas);
            hortaData.append('atividadeDescricao', formData.atividadeDescricao);
            hortaData.append('imagem', formData.imagem);
            hortaData.append('idUnidadeEnsino', 1); // Placeholder, conforme schema NOT NULL
            if (formData.funcaoCargo) hortaData.append('funcaoUniEnsino', formData.funcaoCargo);
            if (formData.caracteristicaGrupo) hortaData.append('caracteristicaGrupo', formData.caracteristicaGrupo);
            if (formData.parceria) hortaData.append('parceria', formData.parceria);

            await api.post('/hortas', hortaData, { headers: { 'Content-Type': 'multipart/form-data' } });
            
            setSuccess("Sua solicitação foi enviada com sucesso! Entraremos em contato em breve.");
            setTimeout(onClose, 5000);

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data || "Ocorreu uma falha ao enviar a solicitação.";
            setError(`Erro: ${errorMessage}`);
            setCaptchaResetKey(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    };
    
    const renderField = (label, name, options = {}) => {
        const { type = 'text', required = false, selectOptions = [] } = options;
        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
                {type === 'select' ? (
                    <select id={name} name={name} value={formData[name]} onChange={handleChange} required={required} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm">
                        <option value="">Selecione...</option>
                        {selectOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.nome}</option>)}
                    </select>
                ) : type === 'textarea' ? (
                    <textarea id={name} name={name} value={formData[name]} onChange={handleChange} required={required} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm" rows="3"></textarea>
                ) : (
                    <input type={type} id={name} name={name} value={type === 'file' ? undefined : formData[name]} onChange={handleChange} required={required} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm" />
                )}
            </div>
        );
    };

    const selectedTipo = tiposHorta.find(t => t.idTipoDeHorta == formData.idTipoDeHorta);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[1002] flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-extrabold text-[#1D3557]">Solicitação de Apoio para Horta</h2>
                    <button onClick={onClose} className="text-2xl font-bold text-gray-400 hover:text-gray-700">×</button>
                </div>

                {success && <div className="bg-green-100 p-4 rounded-lg text-green-800 font-semibold">{success}</div>}
                {error && <div className="bg-red-100 p-4 rounded-lg text-red-800 font-semibold">{error}</div>}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset className="border p-4 rounded-lg"><legend className="text-xl font-semibold text-[#1D3557] px-2">Informações do Solicitante</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {renderField("Nome Completo", "nome", { required: true })}
                                {renderField("E-mail", "email", { type: 'email', required: true })}
                                {renderField("Telefone", "telefone", { type: 'tel', required: true })}
                                {renderField("Função/Cargo na unidade", "funcaoCargo")}
                                {renderField("Escolaridade", "escolaridade", { type: 'select', selectOptions: [{id: "SEM_ESCOLARIDADE", nome: "Sem Escolaridade"}, {id: "ENSINO_FUNDAMENTAL_INCOMPLETO", nome: "Fundamental Incompleto"}, {id: "ENSINO_FUNDAMENTAL_COMPLETO", nome: "Fundamental Completo"}, {id: "ENSINO_MEDIO_INCOMPLETO", nome: "Médio Incompleto"}, {id: "ENSINO_MEDIO_COMPLETO", nome: "Médio Completo"}, {id: "ENSINO_SUPERIOR_INCOMPLETO", nome: "Superior Incompleto"}, {id: "ENSINO_SUPERIOR_COMPLETO", nome: "Superior Completo"}, {id: "POS_GRADUACAO", nome: "Pós-graduação"}] })}
                            </div>
                        </fieldset>

                        <fieldset className="border p-4 rounded-lg"><legend className="text-xl font-semibold text-[#1D3557] px-2">Detalhes da Horta</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="md:col-span-2">{renderField("Tipo de Horta", "idTipoDeHorta", { type: 'select', required: true, selectOptions: tiposHorta.map(t => ({id: t.idTipoDeHorta, nome: t.nome})) })}</div>
                                {selectedTipo && (
                                    <>
                                        {['escolar', 'saúde', 'institucional'].some(term => selectedTipo.nome.toLowerCase().includes(term)) && (
                                            <div className="md:col-span-2 flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                <input type="checkbox" id="isPublica" name="isPublica" checked={formData.isPublica} onChange={handleChange} className="h-4 w-4 accent-[#1D3557]"/>
                                                <label htmlFor="isPublica" className="font-medium text-blue-800">Esta é uma instituição pública ou filantrópica sem fins lucrativos?</label>
                                            </div>
                                        )}
                                        {renderField("Endereço da área", "endereco", { required: true })}
                                        {renderField("Tamanho da área (m²)", "tamanhoAreaProducao", { type: 'number', required: true })}
                                        {renderField("Classificação da Área", "idAreaClassificacao", { type: 'select', required: true, selectOptions: areasClassificacao.map(a => ({id: a.idAreaClassificacao, nome: a.nome})) })}
                                        {renderField("Principal atividade produtiva", "idAtividadesProdutivas", { type: 'select', required: true, selectOptions: atividadesProdutivas.map(a => ({id: a.idAtividadesProdutivas, nome: a.nome})) })}
                                        {renderField("Nº de pessoas no grupo", "qntPessoas", { type: 'number', required: true })}
                                        {renderField("Características do grupo", "caracteristicaGrupo", { type: 'textarea' })}
                                        {renderField("Descrição das atividades planejadas", "atividadeDescricao", { type: 'textarea', required: true })}
                                        {renderField("Possui parceria com alguma instituição? Se sim, quais?", "parceria")}
                                        {renderField("Foto da área", "imagem", { type: 'file', required: true })}
                                        
                                        {(selectedTipo.nome.toLowerCase().includes('escolar') || selectedTipo.nome.toLowerCase().includes('saúde')) && renderField("Público beneficiário/Características", "publicoBeneficiario", { type: 'textarea' })}
                                        {selectedTipo.nome.toLowerCase().includes('comunitária') && (
                                            <>
                                                {renderField("Responsável pela comunidade", "responsavelComunidade")}
                                                {renderField("Instituições/coletivos apoiadores", "parceirosComunitarios")}
                                                {renderField("Nº do CadÚnico do responsável (se possuir)", "cadunico")}
                                                <div className="md:col-span-2 flex justify-center pt-4"><FakeCaptcha onChange={setIsCaptchaSolved} resetKey={captchaResetKey} /></div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </fieldset>
                        
                        {formData.idTipoDeHorta && !validation.isValid && <div className="bg-yellow-100 p-3 rounded-lg text-center font-semibold text-yellow-800">{validation.message}</div>}
                        
                        <div className="flex justify-end gap-4 pt-4 border-t mt-4"><button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button><button type="submit" disabled={!validation.isValid || loading} className="px-6 py-2 bg-[#F4D35E] text-[#1D3557] font-bold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">{loading ? 'Enviando...' : 'Enviar Solicitação'}</button></div>
                    </form>
                )}
            </div>
        </div>
    );
}