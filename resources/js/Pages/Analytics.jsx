import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import Card from '@/Components/Card';
import PageHeader from '@/Components/PageHeader';
import { formatCurrency } from '@/Config/currencies';

export default function Analytics({ stats = {} }) {
    const {
        totalExpenses = 0,
        totalProjects = 0,
        totalPhotos = 0,
        totalDocuments = 0,
        expensesByCategory = [],
        expensesByMonth = [],
    } = stats;

    return (
        <AuthenticatedLayout>
            <Head title="Analytics" />

            <div>
                <PageHeader title="Analytics" subtitle="Track your project spending and activity" />

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon="fa-receipt" label="Total Expenses" value={formatCurrency(totalExpenses)} />
                    <StatCard icon="fa-project-diagram" label="Total Projects" value={totalProjects} />
                    <StatCard icon="fa-images" label="Photos Uploaded" value={totalPhotos} />
                    <StatCard icon="fa-file-alt" label="Documents" value={totalDocuments} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Expenses by Category */}
                    <Card>
                        <h3 className="text-xl font-semibold text-white mb-6">Expenses by Category</h3>
                        {expensesByCategory.length === 0 ? (
                            <div className="text-center py-8">
                                <i className="fas fa-chart-pie text-5xl text-gray-600 mb-4"></i>
                                <p className="text-gray-400">No expense data available</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {expensesByCategory.map((cat, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">{cat.category}</span>
                                            <span className="text-white">{formatCurrency(cat.total)}</span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)]"
                                                style={{ width: `${cat.percentage || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Monthly Expenses Trend */}
                    <Card>
                        <h3 className="text-xl font-semibold text-white mb-6">Monthly Expense Trend</h3>
                        {expensesByMonth.length === 0 ? (
                            <div className="text-center py-8">
                                <i className="fas fa-chart-line text-5xl text-gray-600 mb-4"></i>
                                <p className="text-gray-400">No trend data available</p>
                            </div>
                        ) : (
                            <div className="flex items-end gap-2 h-48">
                                {expensesByMonth.map((month, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div 
                                            className="w-full bg-gradient-to-t from-[rgb(139,0,0)] to-[rgb(220,20,60)] rounded-t"
                                            style={{ height: `${month.percentage || 10}%` }}
                                        ></div>
                                        <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
