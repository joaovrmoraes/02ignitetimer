import { HandPalm, Play } from "phosphor-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useState, useEffect } from "react";

import {
  CountdownContainer,
  FormContainer,
  HomeContainer,
  MinutesAmountInput,
  Separator,
  StartCountdownButton,
  StopCountdownButton,
  TaskInput,
} from "./styles";
import { differenceInSeconds } from "date-fns";

const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, "Informe a tarefa"),
  minutesAmount: zod
    .number()
    .min(5, "O ciclo precisa ser de no minimo 5 minutos")
    .max(60, "O ciclo precisa ser de no máximo 60 minutos"),
});

// interface NewCycleFormData {
//   task: string;
//   minutesAmount: number;
// }

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>;

interface Cycle {
  id: string;
  task: string;
  minutesAmount: number;
  startDate: Date;
  interruptedDate?: Date;
}

export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null);
  const [amountSecodsPassed, setamountSecodsPassed] = useState(0);

  const { register, handleSubmit, watch, formState, reset } =
    useForm<NewCycleFormData>({
      resolver: zodResolver(newCycleFormValidationSchema),
      defaultValues: {
        task: "",
        minutesAmount: 0,
      },
    });

  // console.log(formState.errors);

  // Obtendo o data do handleSubmit (task/minutesAmount)
  function handleCreateNewCycle(data: NewCycleFormData) {
    const id = String(new Date().getTime());

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    };

    setCycles((state) => [...state, newCycle]);

    setActiveCycleId(id);
    setamountSecodsPassed(0);

    reset();
  }

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId);

  useEffect(() => {
    let interval: number;

    if (activeCycle) {
      interval = setInterval(() => {
        setamountSecodsPassed(
          differenceInSeconds(new Date(), activeCycle.startDate)
        );
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [activeCycle]);

  const totalSeconds = activeCycle ? activeCycle.minutesAmount * 60 : 0;

  const currentSeconds = activeCycle ? totalSeconds - amountSecodsPassed : 0;

  const minutesAmount = Math.floor(currentSeconds / 60);
  const secondsAmount = currentSeconds % 60;

  const minutes = String(minutesAmount).padStart(2, "0");

  const seconds = String(secondsAmount).padStart(2, "0");

  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutes}: ${seconds}`;
    }
  }, [minutes, seconds]);

  // monitorando o campo task
  const task = watch("task");

  const isSubmitDisabled = !task;

  function handleInterruptCycle() {
    setCycles(
      cycles.map((cycle) => {
        if (cycle === activeCycle) {
          return { ...cycle, interruptedDate: new Date() };
        } else {
          return cycle;
        }
      })
    );

    setActiveCycleId(null);
  }

  console.log(cycles);

  return (
    <HomeContainer>
      {/* passando o handleSubmit importado do userForm
        passando a função criada
      */}
      <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
        <FormContainer>
          <label htmlFor="taks">Vou trabalhar em</label>
          <TaskInput
            id="task"
            disabled={!!activeCycle}
            list="task-suggestion"
            placeholder="Dê um nome para o seu projeto"
            // passando o register como se fosse um name
            {...register("task")}
          />

          <datalist id="task-suggestion">
            <option value="Projeto 1" />
            <option value="Projeto 2" />
            <option value="Projeto 3" />
            <option value="Abacaxi" />
          </datalist>

          <label htmlFor="minutesAmount">durante</label>
          <MinutesAmountInput
            type="number"
            id="minutesAmount"
            placeholder="00"
            step={5}
            min={5}
            max={60}
            disabled={!!activeCycle}
            {...register("minutesAmount", { valueAsNumber: true })}
          />

          <span>minutos</span>
        </FormContainer>

        <CountdownContainer>
          <span>{minutes[0]}</span>
          <span>{minutes[1]}</span>
          <Separator>:</Separator>
          <span>{seconds[0]}</span>
          <span>{seconds[1]}</span>
        </CountdownContainer>
        {activeCycle ? (
          <StopCountdownButton onClick={handleInterruptCycle} type="button">
            <HandPalm size={24} />
            Interromper
          </StopCountdownButton>
        ) : (
          <StartCountdownButton type="submit" disabled={isSubmitDisabled}>
            <Play size={24} />
            Começar
          </StartCountdownButton>
        )}
      </form>
    </HomeContainer>
  );
}
