import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getDashboard } from "../services/dashboardService";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await getDashboard();
            setDashboard(data);
        } catch (error) {
            console.log(error);
        }
    };

    if (!dashboard) {
        return <h2>Loading...</h2>;
    }

    return (
        <DashboardLayout>

            <h1 className="text-4xl font-bold">
                Welcome, {dashboard.name}
            </h1>

            <div className="grid grid-cols-4 gap-6 mt-10">

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Placement Readiness</h3>
                    <h1 className="text-4xl mt-3">{dashboard.readiness}%</h1>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Skills</h3>
                    <h1 className="text-4xl mt-3">
                        {dashboard.skills.length}
                    </h1>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Projects</h3>
                    <h1 className="text-4xl mt-3">
                        {dashboard.projects.length}
                    </h1>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Career Goal</h3>
                    <h2 className="text-xl mt-3">
                        {dashboard.careerGoal}
                    </h2>
                </div>

            </div>

        </DashboardLayout>
    );
}

export default Dashboard;