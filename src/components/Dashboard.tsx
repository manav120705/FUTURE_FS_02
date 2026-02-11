import { Lead } from '../App';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  leads: Lead[];
}

export function Dashboard({ leads }: DashboardProps) {
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  const conversionRate = stats.total > 0 
    ? ((stats.converted / stats.total) * 100).toFixed(1)
    : '0.0';

  const sourceBreakdown = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSources = Object.entries(sourceBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Prepare data for charts
  const statusData = [
    { name: 'New', value: stats.new, color: '#3b82f6' },
    { name: 'Contacted', value: stats.contacted, color: '#eab308' },
    { name: 'Converted', value: stats.converted, color: '#22c55e' },
  ].filter(item => item.value > 0);

  const sourceData = Object.entries(sourceBreakdown)
    .map(([source, count]) => ({
      name: source.length > 15 ? source.substring(0, 15) + '...' : source,
      fullName: source,
      leads: count
    }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 8);

  // Prepare trend data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const trendData = last7Days.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const leadsOnDay = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt).toISOString().split('T')[0];
      return leadDate === dateStr;
    });

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      new: leadsOnDay.filter(l => l.status === 'new').length,
      contacted: leadsOnDay.filter(l => l.status === 'contacted').length,
      converted: leadsOnDay.filter(l => l.status === 'converted').length,
      total: leadsOnDay.length
    };
  });

  // Custom tooltip for better visualization
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">New Leads</p>
              <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Contacted</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.contacted}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Converted</p>
              <p className="text-3xl font-bold text-green-600">{stats.converted}</p>
              <p className="text-xs text-gray-500 mt-1">{conversionRate}% rate</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        {statusData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Lead Sources Bar Chart */}
        {sourceData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Source</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="leads" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Lead Trends Area Chart */}
      {leads.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorContacted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="new" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNew)" name="New" />
              <Area type="monotone" dataKey="contacted" stroke="#eab308" fillOpacity={1} fill="url(#colorContacted)" name="Contacted" />
              <Area type="monotone" dataKey="converted" stroke="#22c55e" fillOpacity={1} fill="url(#colorConverted)" name="Converted" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Conversion Funnel */}
      {stats.total > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">New Leads</span>
                <span className="text-sm text-gray-600">{stats.new} (100%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div
                  className="bg-blue-600 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                  style={{ width: '100%' }}
                >
                  {stats.new}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Contacted</span>
                <span className="text-sm text-gray-600">
                  {stats.contacted} ({((stats.contacted / stats.total) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div
                  className="bg-yellow-600 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                  style={{ width: `${(stats.contacted / stats.total) * 100}%`, minWidth: stats.contacted > 0 ? '50px' : '0' }}
                >
                  {stats.contacted > 0 && stats.contacted}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Converted</span>
                <span className="text-sm text-gray-600">
                  {stats.converted} ({conversionRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div
                  className="bg-green-600 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                  style={{ width: `${conversionRate}%`, minWidth: stats.converted > 0 ? '50px' : '0' }}
                >
                  {stats.converted > 0 && stats.converted}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}