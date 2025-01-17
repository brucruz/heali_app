import { useCallback, useMemo, useState, ReactElement } from 'react';

import ButtonNext from '@/components/atom/ButtonNext';
import DateSelector from '@/components/molecule/DateSelector';
import PageTemplate from '@/components/templates/PageTemplate';
import hoursCheckboxes from '@/contents/pages/DateSelectionPage/hoursCheckboxes';
import {
  DateRange,
  Group,
  HourSelection,
} from '@/styles/pages/DateSelectionPage';
import { useDates } from '@/hooks/dates';
import { parse } from 'date-fns';
import Checkbox from '@/components/atom/Checkbox';
import { useRouter } from 'next/router';
import mixpanel from 'mixpanel-browser';
import { useAuth } from '@/hooks/auth';
import SEO from '@/components/atom/SEO';

interface DateErrors {
  fromDate?: string;
  toDate?: string;
}

const DateSelectionPage = (): ReactElement => {
  const [fromDate, setFromDate] = useState<Date>(null);
  const [toDate, setToDate] = useState<Date>(null);
  const [errors, setErrors] = useState<DateErrors>(null);

  const {
    selectPreferredFromDate,
    selectPreferredToDate,
    selectPreferredHour,
    preferredHours,
    preferredDateFrom,
    preferredDateTo,
  } = useDates();
  const { user } = useAuth();
  const router = useRouter();
  const { patientId } = router.query;

  const toStartDate = useMemo(() => {
    return fromDate || new Date();
  }, [fromDate]);

  const getFromDate = useCallback(
    (date: Date) => {
      selectPreferredFromDate(date);
      setFromDate(date);
    },
    [selectPreferredFromDate],
  );

  const getToDate = useCallback(
    (date: Date) => {
      selectPreferredToDate(date);
      setToDate(date);
    },
    [selectPreferredToDate],
  );

  const getFromTypedDate = useCallback((date: string) => {
    const parsedDate = parse(date, 'dd/MM/yyyy', new Date());

    setFromDate(parsedDate);
  }, []);

  const getToTypedDate = useCallback((date: string) => {
    const parsedDate = parse(date, 'dd/MM/yyyy', new Date());

    setToDate(parsedDate);
  }, []);

  const checkIfFromDateIsTrue = useCallback(() => {
    if (fromDate?.toString() === 'Invalid Date') {
      setErrors({
        fromDate:
          'Data de Nascimento obrigatória. Você deve digitar o endereço no formato: DD/MM/AAAA',
      });
    } else {
      setErrors({
        fromDate: null,
      });

      selectPreferredFromDate(fromDate);
    }
  }, [fromDate, selectPreferredFromDate]);

  const checkIfToDateIsTrue = useCallback(() => {
    if (toDate?.toString() === 'Invalid Date') {
      setErrors({
        toDate:
          'Data de Nascimento obrigatória. Você deve digitar o endereço no formato: DD/MM/AAAA',
      });
    } else {
      setErrors({
        toDate: null,
      });

      selectPreferredToDate(toDate);
    }
  }, [toDate, selectPreferredToDate]);

  const handleSubmit = useCallback(() => {
    user && mixpanel.identify(user.id);
    mixpanel.track('Selected Preferred Dates');

    router.push({
      pathname: `/checkout/${patientId}/confirmar`,
    });
  }, [user, router, patientId]);

  return (
    <PageTemplate
      titleMain={{
        title: 'Entre quais dias ficaria melhor?',
        subTitle: 'Selecione as datas que pretende realizar os exames.',
      }}
      buttonType={{
        type: 'link',
        backLinkUrl: '/checkout/paciente',
      }}
    >
      <SEO
        title="Qual a data desejada para realização do exame?"
        description="Informe a data desejada para a realização do exame."
        canonical={`checkout/${patientId}/data`}
      />

      <DateRange>
        <DateSelector
          name="fromDate"
          label="A partir de:"
          startDate={new Date()}
          getSelectedDate={getFromDate}
          getTypedDate={getFromTypedDate}
          error={errors?.fromDate && errors.fromDate}
          onBlur={checkIfToDateIsTrue}
        />

        <DateSelector
          name="toDate"
          label="Até:"
          startDate={toStartDate}
          getSelectedDate={getToDate}
          getTypedDate={getToTypedDate}
          error={errors?.toDate && errors.toDate}
          onBlur={checkIfFromDateIsTrue}
        />
      </DateRange>

      <HourSelection>
        <h3>Selecione os horários preferíveis:</h3>

        {hoursCheckboxes &&
          hoursCheckboxes.map(hour => {
            const { period, hours } = hour;

            return (
              <Group key={`${hour}-group`}>
                <h4>{period}</h4>

                <div>
                  {hours.map(checkbox => (
                    <Checkbox
                      key={`${checkbox.id}-checkbox`}
                      isChecked={preferredHours.includes(checkbox.id)}
                      onChange={() => selectPreferredHour(checkbox.id)}
                      label={checkbox.label}
                      id={checkbox.id}
                    />
                  ))}
                </div>
              </Group>
            );
          })}
      </HourSelection>

      <ButtonNext
        text="Continuar"
        disabled={
          !preferredDateFrom || !preferredDateTo || preferredHours.length === 0
        }
        onClick={handleSubmit}
      />
    </PageTemplate>
  );
};

export default DateSelectionPage;
