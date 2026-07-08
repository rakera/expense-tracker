import { Link } from 'react-router-dom';

import { useCurrentUser } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { RecentTransactions } from '@/widgets/recent-transactions';

const menu = [
  {
    to: ROUTES.transactions,
    title: 'Транзакции',
    description: 'Доходы и расходы, история операций.',
  },
  {
    to: ROUTES.categories,
    title: 'Категории',
    description: 'Управление категориями операций.',
  },
];

export function DashboardPage() {
  const user = useCurrentUser();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {user ? `Привет, ${user.name}!` : 'Дашборд'}
        </h1>
        <p className="mt-2 text-muted-foreground">Обзор ваших финансов.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {menu.map((item) => (
          <Link key={item.to} to={item.to} className="block">
            <Card className="transition-colors hover:border-brand">
              <CardHeader>
                <CardTitle className="text-brand">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <RecentTransactions />
    </section>
  );
}
