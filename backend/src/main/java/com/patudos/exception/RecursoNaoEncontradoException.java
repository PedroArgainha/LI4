package com.patudos.exception;

// Lançada quando um recurso não existe na BD
public class RecursoNaoEncontradoException extends RuntimeException {
  public RecursoNaoEncontradoException(String mensagem) {
    super(mensagem);
  }
}