import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { utilizadorApi } from '../../api/utilizadorApi';
import { Avatar } from '../../components/ui/Avatar';
import { ROLE_LABELS } from '../../utils/roles';
import type { EditarPerfilRequest } from '../../types/auth';

type FormState = {
  nome: string;
  telefone: string;
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const maybeAxiosError = error as { response?: { data?: { message?: string; erro?: string } } };
    return maybeAxiosError.response?.data?.message
        ?? maybeAxiosError.response?.data?.erro
        ?? 'Não foi possível atualizar o perfil.';
  }

  if (error instanceof Error) return error.message;

  return 'Não foi possível atualizar o perfil.';
}

export default function PerfilPage() {
  const { utilizador, atualizarUtilizador } = useAuthStore();
  const [form, setForm] = useState<FormState>({ nome: '', telefone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (utilizador) {
      setForm({
        nome: utilizador.nome ?? '',
        telefone: utilizador.telefone ?? '',
      });
    }
  }, [utilizador]);

  const hasChanges = useMemo(() => {
    if (!utilizador) return false;
    return form.nome.trim() !== utilizador.nome || form.telefone.trim() !== (utilizador.telefone ?? '');
  }, [form.nome, form.telefone, utilizador]);

  const mutation = useMutation({
    mutationFn: (data: EditarPerfilRequest) => {
      if (!utilizador) throw new Error('Sessão inválida.');
      return utilizadorApi.editarPerfil(utilizador.id, data);
    },
    onSuccess: (updatedUser) => {
      atualizarUtilizador(updatedUser);
      setIsEditing(false);
      setErrorMessage(null);
      setSuccessMessage('Perfil atualizado com sucesso.');
    },
    onError: (error) => {
      setSuccessMessage(null);
      setErrorMessage(getErrorMessage(error));
    },
  });

  if (!utilizador) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const nome = form.nome.trim();
    const telefone = form.telefone.trim();

    if (nome.length < 2) {
      setErrorMessage('O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    if (telefone.length === 0) {
      setErrorMessage('O telefone é obrigatório.');
      return;
    }

    mutation.mutate({ nome, telefone });
  };

  const handleCancel = () => {
    setForm({
      nome: utilizador.nome ?? '',
      telefone: utilizador.telefone ?? '',
    });
    setIsEditing(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">O Meu Perfil</h1>
            <p className="mt-1 text-sm text-[#74777D]">
              Consulte e atualize os seus dados pessoais associados à conta.
            </p>
          </div>

          {!isEditing && (
              <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  className="rounded-md bg-[#041525] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#12314F]"
              >
                Editar perfil
              </button>
          )}
        </div>

        <div className="border border-[#C4C6CC] bg-white p-6">
          <div className="mb-6 flex items-center gap-4 border-b border-[#E7E8E9] pb-6">
            <Avatar name={utilizador.nome} size="lg" />
            <div>
              <p className="font-noto-serif text-xl font-bold text-[#041525]">{utilizador.nome}</p>
              <p className="text-sm text-[#74777D]">{ROLE_LABELS[utilizador.tipoConta]}</p>
            </div>
          </div>

          {successMessage && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {successMessage}
              </div>
          )}

          {errorMessage && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {errorMessage}
              </div>
          )}

          {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="nome" className="mb-1 block text-sm font-medium text-[#44474C]">
                    Nome
                  </label>
                  <input
                      id="nome"
                      type="text"
                      value={form.nome}
                      onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
                      className="w-full rounded-md border border-[#C4C6CC] px-3 py-2 text-sm text-[#041525] outline-none focus:border-[#041525] focus:ring-1 focus:ring-[#041525]"
                      autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="mb-1 block text-sm font-medium text-[#44474C]">
                    Telefone
                  </label>
                  <input
                      id="telefone"
                      type="tel"
                      value={form.telefone}
                      onChange={(event) => setForm((prev) => ({ ...prev, telefone: event.target.value }))}
                      className="w-full rounded-md border border-[#C4C6CC] px-3 py-2 text-sm text-[#041525] outline-none focus:border-[#041525] focus:ring-1 focus:ring-[#041525]"
                      autoComplete="tel"
                  />
                </div>

                <div className="grid gap-3 border-t border-[#E7E8E9] pt-4 sm:grid-cols-2">
                  <div>
                    <span className="text-sm text-[#44474C]">Email</span>
                    <p className="mt-1 text-sm font-medium text-[#041525]">{utilizador.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#44474C]">Perfil</span>
                    <p className="mt-1 text-sm font-medium text-[#041525]">{ROLE_LABELS[utilizador.tipoConta]}</p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                      type="button"
                      onClick={handleCancel}
                      disabled={mutation.isPending}
                      className="rounded-md border border-[#C4C6CC] px-4 py-2 text-sm font-medium text-[#041525] transition hover:bg-[#F4F5F6] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                      type="submit"
                      disabled={mutation.isPending || !hasChanges}
                      className="rounded-md bg-[#041525] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#12314F] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {mutation.isPending ? 'A guardar...' : 'Guardar alterações'}
                  </button>
                </div>
              </form>
          ) : (
              <div className="space-y-4">
                {[
                  ['Email', utilizador.email],
                  ['Telefone', utilizador.telefone || '—'],
                  ['Perfil', ROLE_LABELS[utilizador.tipoConta]],
                ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b border-[#E7E8E9] pb-3">
                      <span className="text-sm text-[#44474C]">{label}</span>
                      <span className="text-sm font-medium text-[#041525]">{value}</span>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}
