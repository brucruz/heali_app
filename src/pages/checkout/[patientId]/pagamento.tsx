import PageTemplate from '@/components/templates/PageTemplate';
import { ReactElement, useCallback, useState, useEffect } from 'react';
import Checkbox from '@/components/atom/Checkbox';
import Input from '@/components/atom/Input';
import Button from '@/components/atom/Button';
import { Container } from '@/styles/pages/checkout/[patientId]/Payment';
import { usePayment } from '@/hooks/payment';
import { useAuth } from '@/hooks/auth';
import PaymentSelector from '@/components/organisms/PaymentSelector';
import axios, { AxiosResponse } from 'axios';
import mixpanel from 'mixpanel-browser';
import { useBag } from '@/hooks/bag';
import { QuoteResponse } from '@/pages/checkout/[patientId]/confirmar';
import { cpf } from 'cpf-cnpj-validator';
import { useRouter } from 'next/router';

interface IPageTemplateState {
  titleMain: {
    title: string;
    subTitle: string;
  };
}

interface DisabledInputs {
  neighborhood?: boolean;
  street?: boolean;
  city?: boolean;
  state?: boolean;
}

interface CepResponse {
  neighborhood?: string;
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

const pageTemplateState: IPageTemplateState[] = [
  {
    titleMain: {
      title: 'Como prefere Pagar?',
      subTitle: 'Selecione a forma de pagamento',
    },
  },
  {
    titleMain: {
      title: 'Quais são os dados do pagador?',
      subTitle:
        'Estes dados são necessários para obtermos aprovação do pagamento',
    },
  },
  {
    titleMain: {
      title: 'Qual o endereço de cobrança?',
      subTitle:
        'Estes dados são necessários para obtermos aprovação do pagamento',
    },
  },
];

export default function Payment(): ReactElement {
  const [quote, setQuote] = useState<QuoteResponse>({} as QuoteResponse);
  const [isCpfValid, setIsCpfValid] = useState(null);
  const router = useRouter();
  const { patientId } = router.query;

  const [currentStep, setCurrentStep] = useState(0);
  const [isContinueButtonDisabled, setIsContinueButtonDisabled] = useState(
    false,
  );
  const [disabledInputs, setDisabledInputs] = useState<DisabledInputs>(
    {} as DisabledInputs,
  );
  const [useUserData, setUseUserData] = useState(false);
  const { bagItems, bagTotalPrice } = useBag();

  const {
    paymentData,
    changePaymentData,
    handlePaymentWithCreditCard,
    handleBillOfExchange,
  } = usePayment();

  const { user } = useAuth();

  useEffect(() => {
    setQuote(JSON.parse(sessionStorage.getItem('@Heali:quote')));
  }, []);

  useEffect(() => {
    if (bagTotalPrice > 0 && !paymentData.amount) {
      changePaymentData({
        ...paymentData,
        amount: bagTotalPrice * 100,
      });
    }
  }, [bagTotalPrice, paymentData, changePaymentData]);

  useEffect(() => {
    user && mixpanel.identify(user.id);
    mixpanel.track('Page View', {
      'Page Title': 'Payment Page',
    });
  }, [user]);

  const handleFinishPayment = useCallback(() => {
    paymentData.payment_method === 'credit_card'
      ? handlePaymentWithCreditCard(bagItems, user)
      : handleBillOfExchange(quote.dates.to, bagItems, user);
  }, [
    bagItems,
    handleBillOfExchange,
    handlePaymentWithCreditCard,
    paymentData.payment_method,
    quote.dates?.to,
    user,
  ]);

  useEffect(() => {
    if (currentStep === 1) {
      if (
        !paymentData.full_name ||
        !isCpfValid ||
        !paymentData.tel ||
        !paymentData.email
      ) {
        setIsContinueButtonDisabled(true);
      } else {
        setIsContinueButtonDisabled(false);
      }
    } else if (currentStep === 2) {
      if (
        !paymentData.address?.cep ||
        !paymentData.address?.city ||
        !paymentData.address?.neighborhood ||
        !paymentData.address?.state ||
        !paymentData.address?.street ||
        !paymentData.address?.street_number
      ) {
        setIsContinueButtonDisabled(true);
      } else {
        setIsContinueButtonDisabled(false);
      }
    }
  }, [
    currentStep,
    paymentData.address,
    paymentData.full_name,
    paymentData.document,
    paymentData.tel,
    paymentData.email,
    isCpfValid,
  ]);

  function handleCurrentStep(): void {
    switch (currentStep) {
      case 0: {
        setCurrentStep(1);
        break;
      }

      case 1: {
        setCurrentStep(2);
        break;
      }

      default:
        break;
    }
  }

  const handleBackButton = useCallback(
    state => {
      setCurrentStep(state);
    },
    [setCurrentStep],
  );

  return (
    <PageTemplate
      buttonType={
        currentStep === 0
          ? {
              type: 'go_back_button',
              stepper: '1/3',
              backFunction: () =>
                router.replace(`/checkout/${patientId}/confirmar`),
            }
          : {
              type: 'change_state_button',
              stepper: currentStep === 1 ? '2/3' : '3/3',
              backButtonNewState: currentStep - 1,
              backButtonStateCallback: handleBackButton,
            }
      }
      titleMain={pageTemplateState[currentStep].titleMain}
    >
      <Container>
        {currentStep === 0 && (
          <PaymentSelector handleCurrentStep={handleCurrentStep} />
        )}
        {currentStep === 1 && (
          <>
            <Checkbox
              label="Utilizar meus dados de usuário para o pagamento"
              id="checkbox-payment"
              onChange={() => {
                if (!useUserData) {
                  changePaymentData({
                    ...paymentData,
                    full_name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    tel: user.phone_whatsapp && user.phone_whatsapp,
                  });
                } else {
                  changePaymentData({
                    ...paymentData,
                    full_name: '',
                    email: '',
                    tel: '',
                  });
                }

                setUseUserData(!useUserData);
              }}
              isChecked={useUserData}
            />
            <Input
              className="input-payment"
              name="input-user-name"
              value={paymentData.full_name}
              onChange={event =>
                changePaymentData({
                  ...paymentData,
                  full_name: event.target.value,
                })
              }
              label="Nome completo"
            />
            <Input
              className="input-payment"
              name="input-user-document"
              label="CPF"
              errorProps={
                isCpfValid === false && 'O CPF digitado não é válido.'
              }
              onBlur={() =>
                cpf.isValid(paymentData.document?.document_number)
                  ? setIsCpfValid(true)
                  : setIsCpfValid(false)
              }
              mask="999.999.999-99"
              value={paymentData.document?.document_number}
              onChange={event =>
                changePaymentData({
                  ...paymentData,
                  document: {
                    ...paymentData.document,
                    document_number: event.target.value,
                  },
                })
              }
            />
            <Input
              className="input-payment"
              name="input-user-email"
              label="E-mail"
              value={paymentData.email}
              onChange={event =>
                changePaymentData({
                  ...paymentData,
                  email: event.target.value,
                })
              }
            />
            <Input
              className="input-payment last-element"
              name="input-user-telefone"
              label="Telefone"
              value={paymentData.tel}
              onChange={event =>
                changePaymentData({
                  ...paymentData,
                  tel: event.target.value,
                })
              }
            />
          </>
        )}
        {currentStep === 2 && (
          <>
            <Input
              className="input-payment"
              name="input-cep"
              label="CEP"
              mask="99999999"
              onBlur={() => {
                const cep = paymentData.address?.cep;
                if (cep.length === 8) {
                  axios
                    .get(
                      `https://api.pagar.me/1/zipcodes/${cep}?api-key=${process.env.NEXT_PUBLIC_PAGARME_API_KEY}`,
                    )
                    .then((res: AxiosResponse<CepResponse>) => {
                      const { data } = res;
                      changePaymentData({
                        ...paymentData,
                        address: {
                          ...paymentData.address,
                          street: data.street
                            ? data.street
                            : paymentData.address?.street,
                          neighborhood: data.neighborhood
                            ? data.neighborhood
                            : paymentData.address?.neighborhood,
                          city: data.city
                            ? data.city
                            : paymentData.address?.city,
                          state: data.state
                            ? data.state
                            : paymentData.address?.state,
                        },
                      });

                      setDisabledInputs({
                        ...disabledInputs,
                        street: !!data.street,
                        neighborhood: !!data.neighborhood,
                        city: !!data.city,
                        state: !!data.state,
                      });
                    });
                } else {
                  changePaymentData({
                    ...paymentData,
                    address: {
                      ...paymentData.address,
                      street: '',
                      neighborhood: '',
                      city: '',
                      state: '',
                    },
                  });

                  setDisabledInputs({
                    ...disabledInputs,
                    street: false,
                    neighborhood: false,
                    city: false,
                    state: false,
                  });
                }
              }}
              value={paymentData.address?.cep}
              onChange={event => {
                const cep = event.target.value.replace(/_*/gm, '');

                changePaymentData({
                  ...paymentData,
                  address: {
                    ...paymentData.address,
                    cep,
                  },
                });
              }}
            />
            <Input
              className="input-payment"
              name="input-street"
              disabled={disabledInputs.street}
              label="Rua"
              value={paymentData.address?.street}
              onChange={event =>
                changePaymentData({
                  ...paymentData,
                  address: {
                    ...paymentData.address,
                    street: event.target.value,
                  },
                })
              }
            />
            <div className="double-input-div">
              <Input
                className="input-payment"
                name="input-house-number"
                label="Numero"
                value={paymentData.address?.street_number}
                onChange={event =>
                  changePaymentData({
                    ...paymentData,
                    address: {
                      ...paymentData.address,
                      street_number: event.target.value,
                    },
                  })
                }
              />
              <Input
                className="input-payment"
                name="input-house-complement"
                label="Complemento"
                value={paymentData.address?.complement}
                onChange={event =>
                  changePaymentData({
                    ...paymentData,
                    address: {
                      ...paymentData.address,
                      complement: event.target.value,
                    },
                  })
                }
              />
            </div>
            <Input
              className="input-payment"
              name="input-neighborhood"
              label="Bairro"
              disabled={disabledInputs.neighborhood}
              value={paymentData.address?.neighborhood}
              onChange={event =>
                changePaymentData({
                  ...paymentData,
                  address: {
                    ...paymentData.address,
                    neighborhood: event.target.value,
                  },
                })
              }
            />
            <Input
              className="input-payment"
              name="input-city"
              disabled={disabledInputs.city}
              label="Cidade"
              value={paymentData.address?.city}
              onChange={event =>
                changePaymentData({
                  ...paymentData,
                  address: {
                    ...paymentData.address,
                    city: event.target.value,
                  },
                })
              }
            />
            <Input
              className="input-payment last-element"
              name="input-state"
              label="UF"
              disabled={disabledInputs.state}
              value={paymentData.address?.state}
              onChange={event =>
                changePaymentData({
                  ...paymentData,
                  address: {
                    ...paymentData.address,
                    state: event.target.value,
                  },
                })
              }
            />
          </>
        )}
      </Container>
      {currentStep !== 0 && (
        <Button
          disabled={isContinueButtonDisabled}
          onClick={() =>
            currentStep === 1 ? handleCurrentStep() : handleFinishPayment()
          }
        >
          {currentStep === 1 ? 'Continuar' : 'Finalizar pagamento'}
        </Button>
      )}
    </PageTemplate>
  );
}
