"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllAssessments } from "@/services/analytics-services/assessment-service";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import useTitle from "@/hooks/useTitle";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

// ---------------- TYPES ----------------
type DurationType = "Just Started" | "Few weeks" | "Few months" | "Long time";
type SupportType = "chat" | "voice" | "video";
type MatchingPref = "auto" | "manual";
type SpokenBefore = "Yes" | "No" | "Prefer not to say";

type Assessment = {
  _id: string;
  feeling: number;
  duration: DurationType;
  spokenBefore: SpokenBefore;
  supportType: SupportType;
  matchingPref: MatchingPref;
  createdAt: string;
};

// ---------------- COMPONENT ----------------
export default function Assessments() {
  useTitle("Assessments");
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAssessments()
      .then((res) => setData(res.data.data as Assessment[]))
      .finally(() => setLoading(false));
  }, []);

  const total = data.length;

  // Emotional severity groups
  const severity = useMemo(() => {
    const low = data.filter((a) => a.feeling <= 1).length;
    const medium = data.filter(
      (a) => a.feeling === 2 || a.feeling === 3,
    ).length;
    const high = data.filter((a) => a.feeling >= 4).length;
    return { low, medium, high };
  }, [data]);

  const severityChart = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        data: [severity.low, severity.medium, severity.high],
        backgroundColor: ["#4ade80", "#facc15", "#f87171"],
        borderColor: ["#22c55e", "#eab308", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  // Support type counts
  const supportMap = useMemo<Record<SupportType, number>>(() => {
    const map: Record<SupportType, number> = { chat: 0, voice: 0, video: 0 };
    data?.forEach((a) => map[a.supportType]++);
    return map;
  }, [data]);

  const supportChart = {
    labels: ["Chat", "Voice", "Video"],
    datasets: [
      {
        label: "Users",
        data: Object.values(supportMap),
        backgroundColor: ["#60a5fa", "#a78bfa", "#f472b6"],
        borderColor: ["#3b82f6", "#8b5cf6", "#ec4899"],
        borderWidth: 1,
      },
    ],
  };

  // Duration severity index
  const durationWeight: Record<DurationType, number> = {
    "Just Started": 1,
    "Few weeks": 2,
    "Few months": 3,
    "Long time": 4,
  };

  const severityIndex =
    data.reduce((sum, a) => sum + durationWeight[a.duration], 0) / (total || 1);

  // User history
  const firstTimers = data.filter((a) => a.spokenBefore === "No").length;
  const returning = data.filter((a) => a.spokenBefore === "Yes").length;

  // Insight engine
  const insight = useMemo(() => {
    if (severity.high > severity.medium)
      return "High emotional distress trend detected.";
    if (supportMap.voice > supportMap.chat)
      return "Users prefer voice support — deeper engagement needed.";
    return "Majority show moderate stress with chat preference.";
  }, [severity, supportMap]);

  // Additional metrics
  const avgSeverity = (
    data.reduce((sum, a) => sum + a.feeling, 0) / (total || 1)
  ).toFixed(1);

  const mostCommonDuration =
    Object.entries(
      data.reduce(
        (acc, a) => {
          acc[a.duration] = (acc[a.duration] || 0) + 1;
          return acc;
        },
        {} as Record<DurationType, number>,
      ),
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const autoMatchingCount = data.filter(
    (a) => a.matchingPref === "auto",
  ).length;
  const autoMatchingPercent = (
    (autoMatchingCount / (total || 1)) *
    100
  ).toFixed(0);

  if (loading)
    return <div className="p-10 text-center">Loading analytics...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{total}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              First-Time Users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {firstTimers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Returning Users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{returning}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Severity Index
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {severityIndex.toFixed(2)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Average Severity
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {avgSeverity}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Auto Matching</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {autoMatchingPercent}%
          </CardContent>
        </Card>
      </div>

      {/* AI Insight Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insight</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{insight}</p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emotional Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Pie
                data={severityChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support Preference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Bar
                data={supportChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Most Common Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mostCommonDuration}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Problem duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              High Severity Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{severity.high}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {((severity.high / (total || 1)) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Preferred Support Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">
              {Object.entries(supportMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
                "N/A"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {Object.entries(supportMap).sort((a, b) => b[1] - a[1])[0]?.[1] ||
                0}{" "}
              users
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>📘 How the Scoring System Works (Human Guide)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <strong>Feeling Score (0–5)</strong>
              <br />
              This is the user’s emotional intensity. 0–1 = Low stress • 2–3 =
              Moderate strain • 4–5 = High distress
            </div>

            <div>
              <strong>Severity Index</strong>
              <br />
              Average of how long users have had their issue. Higher = problems
              lasting longer across the user base.
            </div>

            <div>
              <strong>Average Severity</strong>
              <br />
              Mean of all feeling scores. Shows overall emotional pressure in
              your platform.
            </div>

            <div>
              <strong>Emotional Severity Distribution</strong>
              <br />
              Counts how many users fall into Low, Medium, and High groups.
            </div>

            <div>
              <strong>Support Preference</strong>
              <br />
              Chat = lower barrier • Voice = deeper connection • Video = highest
              engagement.
            </div>

            <div>
              <strong>User History</strong>
              <br />
              First-time users may need more reassurance. Returning users
              indicate ongoing support journeys.
            </div>

            <div>
              <strong>Matching Preference</strong>
              <br />
              Auto = trust in system intelligence. Manual = desire for personal
              control.
            </div>

            <div>
              <strong>High Severity %</strong>
              <br />
              Percentage of users scoring 4–5. This signals urgent emotional
              support demand.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
