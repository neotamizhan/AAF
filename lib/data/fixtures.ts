import type {
  ActualResult,
  Alliance,
  Candidate,
  Constituency,
  District,
  Election,
  ElectionCandidate,
  LeaderboardRow,
  Party,
  Prediction,
  PreviousResult,
  Submission,
  Zone
} from "@/lib/types";
import { normalizeCandidateName } from "@/lib/csv/normalize";

export const fixtureElection: Election = {
  id: "11111111-1111-4111-8111-111111111111",
  code: "tn-2026",
  name: "Tamil Nadu Assembly Election 2026",
  electionYear: 2026,
  status: "open",
  lockAt: "2026-05-01T18:00:00+05:30",
  resultsImportedAt: null
};

export const fixtureZones: Zone[] = [
  { id: "zone-north", name: "North", sortOrder: 1 },
  { id: "zone-west", name: "West", sortOrder: 2 },
  { id: "zone-delta", name: "Delta", sortOrder: 3 },
  { id: "zone-south", name: "South", sortOrder: 4 },
  { id: "zone-chennai", name: "Chennai", sortOrder: 5 }
];

export const fixtureDistricts: District[] = [
  { id: "district-chennai", name: "Chennai" },
  { id: "district-coimbatore", name: "Coimbatore" },
  { id: "district-madurai", name: "Madurai" },
  { id: "district-thanjavur", name: "Thanjavur" },
  { id: "district-vellore", name: "Vellore" },
  { id: "district-tirunelveli", name: "Tirunelveli" }
];

export const fixtureAlliances: Alliance[] = [
  { id: "alliance-dmk", code: "DMK", name: "DMK bloc", sortOrder: 1 },
  { id: "alliance-admk", code: "ADMK", name: "ADMK bloc", sortOrder: 2 },
  { id: "alliance-ntk", code: "NTK", name: "NTK bloc", sortOrder: 3 },
  {
    id: "alliance-spmk",
    code: "SPMK",
    name: "Sasikala + PMK bloc",
    sortOrder: 4
  },
  { id: "alliance-tvk", code: "TVK", name: "TVK bloc", sortOrder: 5 },
  { id: "alliance-others", code: "OTH", name: "Others", sortOrder: 6 }
];

export const fixtureParties: Party[] = [
  { id: "party-dmk", code: "DMK", name: "Dravida Munnetra Kazhagam", isActive: true },
  {
    id: "party-admk",
    code: "ADMK",
    name: "All India Anna Dravida Munnetra Kazhagam",
    isActive: true
  },
  { id: "party-ntk", code: "NTK", name: "Naam Tamilar Katchi", isActive: true },
  { id: "party-spmk", code: "SPMK", name: "Sasikala + PMK", isActive: true },
  { id: "party-tvk", code: "TVK", name: "Tamilaga Vettri Kazhagam", isActive: true },
  { id: "party-ind", code: "IND", name: "Independent", isActive: true }
];

export const fixtureConstituencies: Constituency[] = [
  {
    id: "ac-chepauk",
    ecCode: "AC-19",
    name: "Chepauk-Thiruvallikeni",
    districtId: "district-chennai",
    zoneId: "zone-chennai",
    isVip: true,
    displayOrder: 19
  },
  {
    id: "ac-coimbatore-south",
    ecCode: "AC-120",
    name: "Coimbatore South",
    districtId: "district-coimbatore",
    zoneId: "zone-west",
    isVip: true,
    displayOrder: 120
  },
  {
    id: "ac-madurai-central",
    ecCode: "AC-193",
    name: "Madurai Central",
    districtId: "district-madurai",
    zoneId: "zone-south",
    isVip: false,
    displayOrder: 193
  },
  {
    id: "ac-thanjavur",
    ecCode: "AC-174",
    name: "Thanjavur",
    districtId: "district-thanjavur",
    zoneId: "zone-delta",
    isVip: false,
    displayOrder: 174
  },
  {
    id: "ac-katpadi",
    ecCode: "AC-40",
    name: "Katpadi",
    districtId: "district-vellore",
    zoneId: "zone-north",
    isVip: true,
    displayOrder: 40
  },
  {
    id: "ac-tirunelveli",
    ecCode: "AC-226",
    name: "Tirunelveli",
    districtId: "district-tirunelveli",
    zoneId: "zone-south",
    isVip: false,
    displayOrder: 226
  }
];

const candidateNames = [
  ["cand-chepauk-dmk", "Udhayanidhi Stalin"],
  ["cand-chepauk-admk", "J. Jayavardhan"],
  ["cand-chepauk-ntk", "S. Rajeswari"],
  ["cand-chepauk-spmk", "R. Manoharan"],
  ["cand-chepauk-tvk", "K. Aravind"],
  ["cand-coimbatore-dmk", "N. Karthik"],
  ["cand-coimbatore-admk", "Amman K. Arjunan"],
  ["cand-coimbatore-ntk", "M. Abdul Wahab"],
  ["cand-coimbatore-spmk", "P. Kavitha"],
  ["cand-coimbatore-tvk", "S. Pradeep"],
  ["cand-madurai-dmk", "P. T. R. Palanivel Thiaga Rajan"],
  ["cand-madurai-admk", "S. S. Saravanan"],
  ["cand-madurai-ntk", "R. Senthil"],
  ["cand-madurai-spmk", "M. Indirani"],
  ["cand-madurai-tvk", "A. Nithya"],
  ["cand-thanjavur-dmk", "T. K. G. Neelamegam"],
  ["cand-thanjavur-admk", "M. Rengasamy"],
  ["cand-thanjavur-ntk", "P. Humayun Kabir"],
  ["cand-thanjavur-spmk", "R. Vetrivel"],
  ["cand-thanjavur-tvk", "D. Kabilan"],
  ["cand-katpadi-dmk", "Duraimurugan"],
  ["cand-katpadi-admk", "V. Ramu"],
  ["cand-katpadi-ntk", "S. Rajesh"],
  ["cand-katpadi-spmk", "K. Sathya"],
  ["cand-katpadi-tvk", "M. Ashwin"],
  ["cand-tirunelveli-dmk", "A. L. S. Lakshmanan"],
  ["cand-tirunelveli-admk", "Nainar Nagendran"],
  ["cand-tirunelveli-ntk", "M. Sathish"],
  ["cand-tirunelveli-spmk", "P. Velmurugan"],
  ["cand-tirunelveli-tvk", "J. John Kennedy"]
] as const;

export const fixtureCandidates: Candidate[] = candidateNames.map(([id, displayName]) => ({
  id,
  displayName,
  normalizedName: normalizeCandidateName(displayName)
}));

const partyAlliance = new Map([
  ["party-dmk", "alliance-dmk"],
  ["party-admk", "alliance-admk"],
  ["party-ntk", "alliance-ntk"],
  ["party-spmk", "alliance-spmk"],
  ["party-tvk", "alliance-tvk"],
  ["party-ind", "alliance-others"]
]);

const candidateRows = [
  ["ac-chepauk", "cand-chepauk-dmk", "party-dmk"],
  ["ac-chepauk", "cand-chepauk-admk", "party-admk"],
  ["ac-chepauk", "cand-chepauk-ntk", "party-ntk"],
  ["ac-chepauk", "cand-chepauk-spmk", "party-spmk"],
  ["ac-chepauk", "cand-chepauk-tvk", "party-tvk"],
  ["ac-coimbatore-south", "cand-coimbatore-dmk", "party-dmk"],
  ["ac-coimbatore-south", "cand-coimbatore-admk", "party-admk"],
  ["ac-coimbatore-south", "cand-coimbatore-ntk", "party-ntk"],
  ["ac-coimbatore-south", "cand-coimbatore-spmk", "party-spmk"],
  ["ac-coimbatore-south", "cand-coimbatore-tvk", "party-tvk"],
  ["ac-madurai-central", "cand-madurai-dmk", "party-dmk"],
  ["ac-madurai-central", "cand-madurai-admk", "party-admk"],
  ["ac-madurai-central", "cand-madurai-ntk", "party-ntk"],
  ["ac-madurai-central", "cand-madurai-spmk", "party-spmk"],
  ["ac-madurai-central", "cand-madurai-tvk", "party-tvk"],
  ["ac-thanjavur", "cand-thanjavur-dmk", "party-dmk"],
  ["ac-thanjavur", "cand-thanjavur-admk", "party-admk"],
  ["ac-thanjavur", "cand-thanjavur-ntk", "party-ntk"],
  ["ac-thanjavur", "cand-thanjavur-spmk", "party-spmk"],
  ["ac-thanjavur", "cand-thanjavur-tvk", "party-tvk"],
  ["ac-katpadi", "cand-katpadi-dmk", "party-dmk"],
  ["ac-katpadi", "cand-katpadi-admk", "party-admk"],
  ["ac-katpadi", "cand-katpadi-ntk", "party-ntk"],
  ["ac-katpadi", "cand-katpadi-spmk", "party-spmk"],
  ["ac-katpadi", "cand-katpadi-tvk", "party-tvk"],
  ["ac-tirunelveli", "cand-tirunelveli-dmk", "party-dmk"],
  ["ac-tirunelveli", "cand-tirunelveli-admk", "party-admk"],
  ["ac-tirunelveli", "cand-tirunelveli-ntk", "party-ntk"],
  ["ac-tirunelveli", "cand-tirunelveli-spmk", "party-spmk"],
  ["ac-tirunelveli", "cand-tirunelveli-tvk", "party-tvk"]
] as const;

export const fixtureElectionCandidates: ElectionCandidate[] = candidateRows.map(
  ([constituencyId, candidateId, partyId]) => ({
    id: `ec-${constituencyId}-${candidateId}`,
    electionId: fixtureElection.id,
    constituencyId,
    candidateId,
    partyId,
    allianceId: partyAlliance.get(partyId) ?? "alliance-others",
    sourceStatus: "verified",
    sourceUrl: null,
    notes: null
  })
);

export const fixturePreviousResults: PreviousResult[] = fixtureConstituencies.flatMap(
  (constituency, constituencyIndex) =>
    [1, 2, 3].map((rank) => ({
      id: `previous-${constituency.id}-${rank}`,
      constituencyId: constituency.id,
      electionYear: 2021,
      rank,
      candidateName:
        rank === 1
          ? `2021 Winner ${constituencyIndex + 1}`
          : rank === 2
            ? `2021 Runner-up ${constituencyIndex + 1}`
            : `2021 Third Place ${constituencyIndex + 1}`,
      partyName: rank === 1 ? "DMK" : rank === 2 ? "ADMK" : "NTK",
      votes: 90000 - rank * 7000 - constituencyIndex * 1200,
      voteShare: Number((48 - rank * 5 - constituencyIndex * 0.4).toFixed(2)),
      sourceUrl: null
    }))
);

export const fixturePredictions: Prediction[] = [
  ["ac-chepauk", "cand-chepauk-dmk", "party-dmk", "alliance-dmk"],
  ["ac-coimbatore-south", "cand-coimbatore-admk", "party-admk", "alliance-admk"],
  ["ac-madurai-central", "cand-madurai-dmk", "party-dmk", "alliance-dmk"],
  ["ac-thanjavur", "cand-thanjavur-dmk", "party-dmk", "alliance-dmk"]
].map(([constituencyId, candidateId, partyId, allianceId], index) => ({
  id: `prediction-${index + 1}`,
  electionId: fixtureElection.id,
  userId: "fixture-user",
  constituencyId,
  predictedCandidateId: candidateId,
  predictedPartyId: partyId,
  predictedAllianceId: allianceId,
  updatedAt: "2026-04-17T08:00:00.000Z"
}));

export const fixtureSubmission: Submission = {
  electionId: fixtureElection.id,
  userId: "fixture-user",
  isFinal: false,
  finalSubmittedAt: null
};

export const fixtureActualResults: ActualResult[] = [
  ["ac-chepauk", "cand-chepauk-dmk", "party-dmk", "alliance-dmk", 92110, 64220],
  [
    "ac-coimbatore-south",
    "cand-coimbatore-admk",
    "party-admk",
    "alliance-admk",
    78100,
    74450
  ],
  ["ac-madurai-central", "cand-madurai-dmk", "party-dmk", "alliance-dmk", 81200, 72200],
  ["ac-thanjavur", "cand-thanjavur-dmk", "party-dmk", "alliance-dmk", 86410, 67720],
  ["ac-katpadi", "cand-katpadi-dmk", "party-dmk", "alliance-dmk", 90550, 78120],
  [
    "ac-tirunelveli",
    "cand-tirunelveli-admk",
    "party-admk",
    "alliance-admk",
    82220,
    79900
  ]
].map(([constituencyId, candidateId, partyId, allianceId, votesWon, runnerUpVotes], index) => {
  const candidate = fixtureCandidates.find((item) => item.id === candidateId);
  return {
    id: `actual-${index + 1}`,
    electionId: fixtureElection.id,
    constituencyId: String(constituencyId),
    winningCandidateId: String(candidateId),
    winningCandidateName: candidate?.displayName ?? String(candidateId),
    winningPartyId: String(partyId),
    winningAllianceId: String(allianceId),
    votesWon: Number(votesWon),
    runnerUpVotes: Number(runnerUpVotes),
    margin: Number(votesWon) - Number(runnerUpVotes),
    sourceUrl: null,
    resultStatus: "final"
  };
});

export const fixtureLeaderboard: LeaderboardRow[] = [
  {
    electionId: fixtureElection.id,
    displayName: "Demo Player",
    totalScore: 42,
    vipHits: 2,
    exactAllianceDistributionHits: 1,
    rank: 1,
    calculatedAt: "2026-05-15T10:00:00.000Z"
  },
  {
    electionId: fixtureElection.id,
    displayName: "Policy Watcher",
    totalScore: 35,
    vipHits: 1,
    exactAllianceDistributionHits: 1,
    rank: 2,
    calculatedAt: "2026-05-15T10:00:00.000Z"
  }
];
