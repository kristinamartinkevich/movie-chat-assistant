import React, { useState } from 'react';
import {
  Button,
  Input,
  Link,
  Form,
} from '@heroui/react';

import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { showErrorToast, showSuccessToast } from '@/services/toastService';
import { Logo } from '@/utils/icons';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      showSuccessToast('sign-up-successful');
    } catch (error: any) {
      showErrorToast('error-signing-up', error.message);
    } finally {
      setPassword('');
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full text-center mb-8">
        <div className="mb-2">
          <Logo />
        </div>
        <h2 className="text-xl font-bold max-w-md">
          {t('welcome-to')} SHARQS
        </h2>
        <div className="text-neutral-500">
          {t('create-account')}
        </div>
      </div>

      <div className='flex justify-center w-full'>
        <Form className="space-y-3 w-full" onSubmit={handleSubmit}>
          <div className="w-full">
            <label className='font-medium mb-2'>E-mail</label>
            <Input
              required
              autoComplete="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="w-full">
            <label className='font-medium mb-2'>{t('password')}</label>
            <Input
              required
              autoComplete="new-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className='flex justify-center w-full'>
            <div className='text-xs text-center max-w-sm'>
              <span className="font-medium text-neutral-500">{t('by-proceeding-you-agree-to-our')}{' '}</span>
              <Link href="/privacy-policy" className="font-medium text-theme text-xs">{t('terms-and-conditions')}</Link>
              <span className='text-neutral-500'>{' '}{t('and-confirm-you-have-read-and-understand-our')}{' '}</span>
              <Link href="/terms-and-conditions" className="font-medium text-theme text-xs">{t('privacy-policy')}</Link>
            </div>
          </div>

          <div className="w-full">
            <Button
              size='lg'
              color="default"
              radius="full"
              className="w-full font-medium bg-black dark:bg-white dark:text-black text-white"
              type="submit"
              href="signup"
            >
              {t('signup')}
            </Button>
          </div>

          <div className="flex flex-col text-center justify-center w-full">
            <div className="text-neutral-500" >
              {t('already-have-account')} <Link href="login" className='underline text-neutral-500'>{t('login')}</Link>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
}
