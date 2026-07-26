import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabase = createClient(
  'https://duvpdircogolckotzjra.supabase.co',
  'sb_publishable_DUsDj3ZsdfJeQcVPcnvNuw_e_YtfnuD'
);

export function showFormStatus(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('hidden');
  element.className = isError
    ? 'mt-4 rounded-2xl border border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-700'
    : 'mt-4 rounded-2xl border border-green-600 bg-green-50 px-4 py-3 text-sm font-medium text-green-800';
}

export function clearFormStatus(element) {
  if (!element) return;
  element.textContent = '';
  element.classList.add('hidden');
}
