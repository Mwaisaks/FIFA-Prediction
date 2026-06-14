export const teams = [
  { id: 1, name: 'Argentina', flag: '🇦🇷', strength: 95 },
  { id: 2, name: 'France', flag: '🇫🇷', strength: 93 },
  { id: 3, name: 'Spain', flag: '🇪🇸', strength: 91 },
  { id: 4, name: 'Germany', flag: '🇩🇪', strength: 90 },
  { id: 5, name: 'England', flag: '🇬🇧', strength: 89 },
  { id: 6, name: 'Brazil', flag: '🇧🇷', strength: 88 },
  { id: 7, name: 'Belgium', flag: '🇧🇪', strength: 87 },
  { id: 8, name: 'Netherlands', flag: '🇳🇱', strength: 86 },
  { id: 9, name: 'Portugal', flag: '🇵🇹', strength: 85 },
  { id: 10, name: 'Italy', flag: '🇮🇹', strength: 84 },
  { id: 11, name: 'Denmark', flag: '🇩🇰', strength: 83 },
  { id: 12, name: 'Uruguay', flag: '🇺🇾', strength: 82 },
  { id: 13, name: 'Croatia', flag: '🇭🇷', strength: 81 },
  { id: 14, name: 'Switzerland', flag: '🇨🇭', strength: 80 },
  { id: 15, name: 'Austria', flag: '🇦🇹', strength: 79 },
  { id: 16, name: 'Turkey', flag: '🇹🇷', strength: 78 },
  { id: 17, name: 'Poland', flag: '🇵🇱', strength: 77 },
  { id: 18, name: 'Mexico', flag: '🇲🇽', strength: 76 },
  { id: 19, name: 'Senegal', flag: '🇸🇳', strength: 75 },
  { id: 20, name: 'Japan', flag: '🇯🇵', strength: 74 },
  { id: 21, name: 'South Korea', flag: '🇰🇷', strength: 73 },
  { id: 22, name: 'Australia', flag: '🇦🇺', strength: 72 },
  { id: 23, name: 'Canada', flag: '🇨🇦', strength: 71 },
  { id: 24, name: 'Greece', flag: '🇬🇷', strength: 70 },
  { id: 25, name: 'Czech Republic', flag: '🇨🇿', strength: 69 },
  { id: 26, name: 'Hungary', flag: '🇭🇺', strength: 68 },
  { id: 27, name: 'Serbia', flag: '🇷🇸', strength: 67 },
  { id: 28, name: 'Romania', flag: '🇷🇴', strength: 66 },
  { id: 29, name: 'Slovakia', flag: '🇸🇰', strength: 65 },
  { id: 30, name: 'Norway', flag: '🇳🇴', strength: 64 },
  { id: 31, name: 'Sweden', flag: '🇸🇪', strength: 63 },
  { id: 32, name: 'Chile', flag: '🇨🇱', strength: 62 },
  { id: 33, name: 'Colombia', flag: '🇨🇴', strength: 61 },
  { id: 34, name: 'Ecuador', flag: '🇪🇨', strength: 60 },
  { id: 35, name: 'Peru', flag: '🇵🇪', strength: 59 },
  { id: 36, name: 'Costa Rica', flag: '🇨🇷', strength: 58 },
  { id: 37, name: 'Panama', flag: '🇵🇦', strength: 57 },
  { id: 38, name: 'Jamaica', flag: '🇯🇲', strength: 56 },
  { id: 39, name: 'Honduras', flag: '🇭🇳', strength: 55 },
  { id: 40, name: 'Uzbekistan', flag: '🇺🇿', strength: 54 },
  { id: 41, name: 'Iran', flag: '🇮🇷', strength: 53 },
  { id: 42, name: 'Lebanon', flag: '🇱🇧', strength: 52 },
  { id: 43, name: 'Saudi Arabia', flag: '🇸🇦', strength: 51 },
  { id: 44, name: 'United Arab Emirates', flag: '🇦🇪', strength: 50 },
  { id: 45, name: 'Jordan', flag: '🇯🇴', strength: 49 },
  { id: 46, name: 'Iraq', flag: '🇮🇶', strength: 48 },
  { id: 47, name: 'India', flag: '🇮🇳', strength: 47 },
  { id: 48, name: 'Cameroon', flag: '🇨🇲', strength: 46 },
]

export type Team = (typeof teams)[0]

export function getTeamById(id: number): Team | undefined {
  return teams.find((team) => team.id === id)
}

export function getTeamByName(name: string): Team | undefined {
  return teams.find((team) => team.name === name)
}
