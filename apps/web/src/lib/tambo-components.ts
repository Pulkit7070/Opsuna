import { z } from 'zod';
import { LoginForm } from '@/components/builder/blocks/LoginForm';
import { StatsCards } from '@/components/builder/blocks/StatsCards';
import { DataTable } from '@/components/builder/blocks/DataTable';
import { PricingCards } from '@/components/builder/blocks/PricingCards';
import { Hero } from '@/components/builder/blocks/Hero';

// Color schema used across components
const accentColorSchema = z.enum(['violet', 'blue', 'emerald', 'rose', 'orange']).optional();

/**
 * Tambo component definitions with Zod schemas
 * These components are registered with Tambo AI for dynamic UI generation
 */
export const tamboComponents = [
  {
    name: 'LoginForm',
    description: 'A beautiful login/sign-in form with email, password, social login options, and customizable styling. Use for authentication, login pages, or sign-in interfaces.',
    component: LoginForm,
    propsSchema: z.object({
      title: z.string().describe('The heading text, e.g. "Welcome back"').optional(),
      subtitle: z.string().describe('Subheading text below the title').optional(),
      showSocialLogin: z.boolean().describe('Whether to show GitHub/Google login buttons').optional(),
      showForgotPassword: z.boolean().describe('Whether to show forgot password link').optional(),
      showRememberMe: z.boolean().describe('Whether to show remember me checkbox').optional(),
      buttonText: z.string().describe('Text for the submit button').optional(),
      accentColor: z.enum(['violet', 'blue', 'emerald', 'rose']).describe('Primary accent color').optional(),
    }),
  },
  {
    name: 'StatsCards',
    description: 'Dashboard statistics cards showing metrics with values, trends (up/down), and change percentages. Great for analytics, KPIs, and dashboard overviews.',
    component: StatsCards,
    propsSchema: z.object({
      title: z.string().describe('Section title like "Dashboard Overview"').optional(),
      stats: z.array(z.object({
        label: z.string().describe('Metric name like "Total Revenue"'),
        value: z.string().describe('The metric value like "$45,231"'),
        change: z.string().describe('Percentage change like "+20.1%"'),
        trend: z.enum(['up', 'down']).describe('Whether the trend is positive or negative'),
      })).describe('Array of statistics to display'),
      columns: z.enum(['2', '3', '4']).transform(v => parseInt(v) as 2 | 3 | 4).describe('Number of columns').optional(),
      accentColor: z.enum(['violet', 'blue', 'emerald', 'orange']).describe('Card accent color').optional(),
    }),
  },
  {
    name: 'DataTable',
    description: 'An interactive data table with search, sorting, and pagination. Perfect for displaying lists of users, products, orders, or any tabular data.',
    component: DataTable,
    propsSchema: z.object({
      title: z.string().describe('Table heading').optional(),
      columns: z.array(z.object({
        key: z.enum(['id', 'name', 'email', 'role', 'status', 'date', 'amount', 'description', 'category', 'quantity']).describe('Data key - must match one of the row fields'),
        label: z.string().describe('Column header text'),
        sortable: z.boolean().describe('Whether column can be sorted').optional(),
      })).describe('Table column definitions'),
      data: z.array(z.object({
        id: z.string().describe('Unique identifier').optional(),
        name: z.string().describe('Name field').optional(),
        email: z.string().describe('Email address').optional(),
        role: z.string().describe('Role or position').optional(),
        status: z.string().describe('Status value like Active, Pending').optional(),
        date: z.string().describe('Date string').optional(),
        amount: z.string().describe('Monetary or numeric amount').optional(),
        description: z.string().describe('Description text').optional(),
        category: z.string().describe('Category or type').optional(),
        quantity: z.string().describe('Quantity value').optional(),
      })).describe('Array of data rows - use fields that match your columns'),
      searchable: z.boolean().describe('Show search input').optional(),
      pageSize: z.number().describe('Rows per page').optional(),
      accentColor: z.enum(['violet', 'blue', 'emerald', 'rose']).describe('Accent color').optional(),
    }),
  },
  {
    name: 'PricingCards',
    description: 'Pricing tier cards with monthly/yearly toggle, features list, and call-to-action buttons. Use for SaaS pricing, subscription plans, or product tiers.',
    component: PricingCards,
    propsSchema: z.object({
      title: z.string().describe('Section heading').optional(),
      subtitle: z.string().describe('Section subheading').optional(),
      plans: z.array(z.object({
        name: z.string().describe('Plan name like "Pro" or "Enterprise"'),
        description: z.string().describe('Short plan description'),
        monthlyPrice: z.number().describe('Monthly price in dollars'),
        yearlyPrice: z.number().describe('Yearly price per month (discounted)'),
        features: z.array(z.string()).describe('List of included features'),
        notIncluded: z.array(z.string()).describe('List of not included features').optional(),
        popular: z.boolean().describe('Mark as most popular plan').optional(),
      })).describe('Array of pricing plans'),
      accentColor: z.enum(['violet', 'blue', 'emerald', 'rose']).describe('Accent color').optional(),
    }),
  },
  {
    name: 'Hero',
    description: 'A hero section with badge, headline, subtitle, CTA buttons, and feature highlights. Perfect for landing pages, product announcements, or marketing pages.',
    component: Hero,
    propsSchema: z.object({
      badge: z.string().describe('Small badge text above title like "Now in Beta"').optional(),
      title: z.string().describe('Main headline text'),
      subtitle: z.string().describe('Supporting description text'),
      primaryButtonText: z.string().describe('Primary CTA button text').optional(),
      secondaryButtonText: z.string().describe('Secondary button text').optional(),
      features: z.array(z.string()).describe('Short feature highlights shown with checkmarks').optional(),
      accentColor: z.enum(['violet', 'blue', 'emerald', 'rose']).describe('Accent color').optional(),
    }),
  },
];

export type TamboComponentName = typeof tamboComponents[number]['name'];
