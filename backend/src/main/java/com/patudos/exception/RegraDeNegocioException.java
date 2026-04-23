package com.patudos.exception;

// Lançada quando uma regra de negócio é violada
// Ex: tentar cancelar uma reserva já concluída
public class RegraDeNegocioException extends RuntimeException {
    public RegraDeNegocioException(String mensagem) {
        super(mensagem);
    }
}