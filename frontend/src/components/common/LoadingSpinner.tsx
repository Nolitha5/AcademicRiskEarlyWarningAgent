export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${dim} animate-spin rounded-full border-4 border-tut-blue border-t-transparent`} />
    </div>
  )
}
