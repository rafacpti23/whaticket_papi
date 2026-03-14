import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Link,
  Stepper,
  Step,
  StepLabel
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2)
  },
  stepContent: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  link: {
    fontWeight: "bold",
    color: theme.palette.primary.main
  },
  code: {
    backgroundColor: theme.palette.grey[200],
    padding: theme.spacing(0.5, 1),
    borderRadius: 4,
    fontFamily: "monospace"
  }
}));

const steps = [
  "Criação do Aplicativo no Meta for Developers",
  "Configuração do WhatsApp no Aplicativo",
  "Obtenção das Credenciais",
  "Configuração do Webhook"
];

const WhatsAppOfficialHelpModal = ({ open, onClose }) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Typography variant="body2">
            1. Acesse o <Link href="https://developers.facebook.com/" target="_blank" className={classes.link}>Meta for Developers</Link>.<br />
            2. Clique em <b>Meus Aplicativos</b> e depois em <b>Criar Aplicativo</b>.<br />
            3. Selecione o tipo <b>Outros</b> e depois <b>Empresarial</b>.<br />
            4. Dê um nome ao seu aplicativo e clique em <b>Criar Aplicativo</b>.
          </Typography>
        );
      case 1:
        return (
          <Typography variant="body2">
            1. No painel do seu aplicativo, role até encontrar <b>WhatsApp</b> e clique em <b>Configurar</b>.<br />
            2. Selecione sua Conta Empresarial (WABA) ou crie uma nova.<br />
            3. Siga as instruções para verificar o número de telefone que deseja usar.
          </Typography>
        );
      case 2:
        return (
          <Typography variant="body2">
            No painel lateral, vá em <b>WhatsApp &gt; Início</b> para encontrar:<br /><br />
            - <b>ID do número de telefone:</b> Identificador único do seu número.<br />
            - <b>ID da conta do WhatsApp Business (WABA):</b> Identificador da sua conta empresarial.<br />
            - <b>Token de acesso temporário/permanente:</b> Use o gerador de tokens no painel de Configurações do Negócio para um token permanente.
          </Typography>
        );
      case 3:
        return (
          <Typography variant="body2">
            Para <b>receber mensagens</b> no sistema, você precisa configurar o webhook na Meta:<br /><br />
            1. No painel do seu aplicativo, vá em <b>WhatsApp &gt; Configuração</b>.<br />
            2. Na seção <b>Webhook</b>, clique em <b>Editar</b>.<br />
            3. No campo <b>URL de retorno</b>, insira:<br />
            <span className={classes.code}>https://SEU_DOMINIO_BACKEND/webhook</span><br /><br />
            4. No campo <b>Token de verificação</b>, insira o mesmo valor configurado na variável <span className={classes.code}>VERIFY_TOKEN</span> do seu backend.<br />
            5. Clique em <b>Verificar e salvar</b>.<br />
            6. Após salvar, clique em <b>Gerenciar</b> e ative o campo <b>messages</b>.<br /><br />
            <b>⚠️ Importante:</b> A URL precisa ser pública (HTTPS). Para testes locais, use <Link href="https://ngrok.com/" target="_blank" className={classes.link}>ngrok</Link> para expor seu servidor local.
          </Typography>
        );
      default:
        return "Passo desconhecido";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Como configurar o WhatsApp Cloud API</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box className={classes.stepContent}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Voltar
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={onClose}>
            Entendi
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleNext}>
            Próximo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WhatsAppOfficialHelpModal;
