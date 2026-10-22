import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getStoredMeasurementSystem,
  saveMeasurementSystem,
} from "../utils/storage";
import { MeasurementSystem } from "../types";

interface MeasurementContextProps {
  measurementSystem: MeasurementSystem;
  setMeasurementSystem: (system: MeasurementSystem) => void;
}

const MeasurementContext = createContext<MeasurementContextProps | undefined>(
  undefined,
);

export const MeasurementProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>(
    getStoredMeasurementSystem,
  );

  useEffect(() => {
    saveMeasurementSystem(measurementSystem);
  }, [measurementSystem]);

  return (
    <MeasurementContext.Provider
      value={{ measurementSystem, setMeasurementSystem }}
    >
      {children}
    </MeasurementContext.Provider>
  );
};

export const useMeasurementSystem = (): MeasurementContextProps => {
  const context = useContext(MeasurementContext);
  if (!context) {
    throw new Error(
      "useMeasurementSystem must be used within MeasurementProvider",
    );
  }
  return context;
};
