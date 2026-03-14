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
    fontFamily: "monospace",
    fontSize: "0.85em"
  }
}));

const steps = [
  "Criar Aplicativo no Mercado Livre",
  "Configurar Permissões",
  "Configurar Webhook",
  "Conectar ao Sistema"
];

const MercadoLivreHelpModal = ({ open, onClose }) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Typography variant="body2">
            1. Acesse o <Link href="https://developers.mercadolivre.com.br/" target="_blank" className={classes.link}>Mercado Livre Developers</Link>.<br />
            2. Faça login com sua conta do Mercado Livre.<br />
            3. Vá em <b>Minhas Aplicações</b> e clique em <b>Criar nova aplicação</b>.<br />
            4. Preencha o nome da aplicação e uma breve descrição.<br />
            5. Anote o <b>App ID</b> e o <b>Client Secret</b> gerados.
          </Typography>
        );
      case 1:
        return (
          <Typography variant="body2">
            Na página da sua aplicação, configure as permissões:<br /><br />
            1. Em <b>Escopos</b>, selecione:<br />
            - <span className={classes.code}>read</span> — Leitura de dados<br />
            - <span className={classes.code}>write</span> — Escrita de dados<br />
            - <span className={classes.code}>offline_access</span> — Acesso offline (refresh token)<br /><br />
            2. Em <b>URIs de redirecionamento</b>, adicione:<br />
            <span className={classes.code}>https://SEU_DOMINIO_BACKEND/mercadolivre/callback</span><br /><br />
            3. Salve as configurações.
          </Typography>
        );
      case 2:
        return (
          <Typography variant="body2">
            Para receber notificações de novas mensagens:<br /><br />
            1. Na configuração da sua aplicação, vá em <b>Notificações</b>.<br />
            2. No campo <b>URL de callback</b>, insira:<br />
            <span className={classes.code}>https://SEU_DOMINIO_BACKEND/mercadolivre/webhook</span><br /><br />
            3. Selecione os tópicos:<br />
            - <span className={classes.code}>messages</span> — Mensagens<br />
            - <span className={classes.code}>orders_v2</span> — Pedidos (opcional)<br /><br />
            <b>⚠️ Importante:</b> A URL precisa ser pública (HTTPS). Para testes locais, use <Link href="https://ngrok.com/" target="_blank" className={classes.link}>ngrok</Link>.
          </Typography>
        );
      case 3:
        return (
          <Typography variant="body2">
            Agora configure as variáveis de ambiente no seu backend:<br /><br />
            <span className={classes.code}>ML_APP_ID=seu_app_id</span><br />
            <span className={classes.code}>ML_CLIENT_SECRET=seu_client_secret</span><br />
            <span className={classes.code}>ML_REDIRECT_URI=https://SEU_DOMINIO/mercadolivre/callback</span><br /><br />
            Após configurar, volte ao sistema e clique no botão <b>"Conectar com Mercado Livre"</b> na tela de conexões. Você será redirecionado para autorizar o acesso.
          </Typography>
        );
      default:
        return "Passo desconhecido";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          <img
            src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo_large_25years@2x.png"
            alt="Mercado Livre"
            style={{ height: 28 }}
          />
          Como configurar o Mercado Livre
        </Box>
      </DialogTitle>
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

export default MercadoLivreHelpModal;
