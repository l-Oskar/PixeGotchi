interface PixegotchiRates {
  hungerRate: number;
  energyRate: number;
  diseaseResistance: number;
  happinesRate: number;
  cleanlinessRate: number;
  lifeRecoveryRate: number;
}

export function getRate(element: string): PixegotchiRates {
  return {
    hungerRate: 1,
    energyRate: 1,
    diseaseResistance: 1,
    happinesRate: 1,
    cleanlinessRate: 1,
    lifeRecoveryRate: 1,
  };
}
