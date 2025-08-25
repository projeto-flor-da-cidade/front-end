// Caminho: src/components/HortaRequestModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';
import FakeCaptcha from './FakeCaptcha';

const ESCOLARIDADE_OPTIONS = [
    { id: 'SEM_ESCOLARIDADE', nome: 'Sem Escolaridade' },
    { id: 'ENSINO_FUNDAMENTAL_INCOMPLETO', nome: 'Fundamental Incompleto' },
    { id: 'ENSINO_FUNDAMENTAL_COMPLETO', nome: 'Fundamental Completo' },
    { id: 'ENSINO_MEDIO_INCOMPLETO', nome: 'Médio Incompleto' },
    { id: 'ENSINO_MEDIO_COMPLETO', nome: 'Médio Completo' },
    { id: 'ENSINO_SUPERIOR_INCOMPLETO', nome: 'Superior Incompleto' },
    { id: 'ENSINO_SUPERIOR_COMPLETO', nome: 'Superior Completo' },
    { id: 'POS_GRADUACAO', nome: 'Pós-graduação' },
];

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
        nome: '',
        cpf: '',
        dataNascimento: '',
        email: '',
        telefone: '',
        escolaridade: 'SEM_ESCOLARIDADE',
        funcaoCargo: '',
        idTipoDeHorta: '',
        endereco: '',
        tamanhoAreaProducao: '',
        idAreaClassificacao: '',
        idAtividadesProdutivas: '',
        qntPessoas: '3',
        caracteristicaGrupo: '',
        atividadeDescricao: '',
        parceria: '',
        imagem: null,
        isPublica: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tiposRes, areasRes, atividadesRes] = await Promise.all([
                    api.get('/tipos-horta'),
                    api.get('/areas-classificacao'),
                    api.get('/atividades-produtivas')
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
            [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const usuarioPayload = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone.replace(/\D/g, ''),
                cpf: formData.cpf.replace(/\D/g, ''),
                dataNascimento: formData.dataNascimento,
                escolaridade: formData.escolaridade,
            };
            const usuarioResponse = await api.post('/usuarios', usuarioPayload);
            const novoUsuario = usuarioResponse.data;

            const hortaJson = {
                nomeHorta: `Solicitação de ${formData.nome}`,
                idUsuario: novoUsuario.idUsuario,
                idTipoDeHorta: formData.idTipoDeHorta,
                endereco: formData.endereco,
                tamanhoAreaProducao: formData.tamanhoAreaProducao,
                idAreaClassificacao: formData.idAreaClassificacao,
                idAtividadesProdutivas: formData.idAtividadesProdutivas,
                qntPessoas: formData.qntPessoas,
                atividadeDescricao: formData.atividadeDescricao,
                idUnidadeEnsino: 1,
                funcaoUniEnsino: formData.funcaoCargo,
                caracteristicaGrupo: formData.caracteristicaGrupo,
                parceria: formData.parceria,
            };

            const hortaFormData = new FormData();
            hortaFormData.append('horta', new Blob([JSON.stringify(hortaJson)], { type: 'application/json' }));
            
            if (formData.imagem) {
                hortaFormData.append('imagem', formData.imagem);
            }
            
            await api.post('/hortas', hortaFormData);
            
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
        const commonProps = {
            id: name,
            name: name,
            onChange: handleChange,
            required: required,
            className: "w-full p-2 border border-gray-300 rounded-lg shadow-sm"
        };

        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
                {type === 'select' ? (
                    <select {...commonProps} value={formData[name]}>
                        <option value="">Selecione...</option>
                        {selectOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.nome}</option>)}
                    </select>
                ) : type === 'textarea' ? (
                    <textarea {...commonProps} value={formData[name]} rows="3"></textarea>
                ) : (
                    <input {...commonProps} type={type} value={type === 'file' ? undefined : formData[name]} />
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
                                {renderField("CPF", "cpf", { required: true })}
                                {renderField("Data de Nascimento", "dataNascimento", { type: 'date', required: true })}
                                {renderField("E-mail", "email", { type: 'email', required: true })}
                                {renderField("Telefone", "telefone", { type: 'tel', required: true })}
                                {renderField("Função/Cargo na unidade", "funcaoCargo")}
                                {renderField("Escolaridade", "escolaridade", { type: 'select', selectOptions: ESCOLARIDADE_OPTIONS })}
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
                                        {renderField("Possui parceria com alguma instituição?", "parceria", { type: 'textarea' })}
                                        <div>
                                            <label htmlFor="imagem" className="block text-sm font-medium text-gray-700 mb-1">Foto da área *</label>
                                            <input type="file" id="imagem" name="imagem" onChange={handleChange} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                                        </div>
                                        
                                        {selectedTipo.nome.toLowerCase().includes('comunitaria') && (
                                            <div className="md:col-span-2 flex justify-center pt-4"><FakeCaptcha onChange={setIsCaptchaSolved} resetKey={captchaResetKey} /></div>
                                        )}
                                    </>
                                )}
                            </div>
                        </fieldset>
                        
                        <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-[#F4D35E] text-[#1D3557] font-bold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {loading ? 'Enviando...' : 'Enviar Solicitação'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

HortaRequestModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};