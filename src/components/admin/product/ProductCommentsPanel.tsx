import { MessageCircle, Trash2 } from 'lucide-react';
import type { ProductComment } from '../../../types/product';

interface Props {
  comments: ProductComment[];
  commentPage: number;
  commentPageSize: number;
  setCommentPage: (page: number) => void;
  setCommentPageSize: (size: number) => void;
  onDeleteComment: (id: number) => void;
}

export const ProductCommentsPanel = ({
  comments,
  commentPage,
  commentPageSize,
  setCommentPage,
  setCommentPageSize,
  onDeleteComment,
}: Props) => {
  const totalPages = Math.ceil(comments.length / commentPageSize);
  const paginatedComments = comments.slice(commentPage * commentPageSize, (commentPage + 1) * commentPageSize);

  return (
    <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
          <MessageCircle size={18} /> Danh sách bình luận
          <span className="ml-1 text-xs font-normal text-gray-400 normal-case">({comments.length} bình luận)</span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Hiển thị:</span>
          <select
            value={commentPageSize}
            onChange={e => { setCommentPageSize(parseInt(e.target.value)); setCommentPage(0); }}
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 p-2 outline-none font-medium"
          >
            <option value="5">5 dòng</option>
            <option value="10">10 dòng</option>
            <option value="20">20 dòng</option>
            <option value="50">50 dòng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Đánh giá</th>
              <th className="px-6 py-4">Nội dung</th>
              <th className="px-6 py-4">Ngày đăng</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {comments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                  Sản phẩm này chưa có bình luận nào.
                </td>
              </tr>
            ) : (
              paginatedComments.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">
                    {c.user}
                    <span className="text-xs text-gray-400 font-normal ml-1">(ID: {c.userId || 'N/A'})</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < c.stars ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-sm break-words">{c.content}</p>
                    {c.replies && c.replies.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <span className="font-bold text-blue-600">Trả lời ({c.replies.length}):</span>
                        {c.replies.map(r => (
                          <div key={r.id} className="mt-1 flex justify-between">
                            <span><strong className="text-gray-700">{r.user}</strong>: {r.content}</span>
                            <button
                              type="button"
                              onClick={() => onDeleteComment(r.id)}
                              className="text-red-400 hover:text-red-600 ml-2"
                              title="Xóa trả lời"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{c.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteComment(c.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Xóa bình luận"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {comments.length > 0 && totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <span className="text-sm text-gray-500 font-medium">
            Trang {commentPage + 1} / {totalPages} &nbsp;·&nbsp; Tổng {comments.length} bình luận
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={commentPage === 0}
              onClick={() => setCommentPage(commentPage - 1)}
              className="px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all text-sm font-medium"
            >
              Trước
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i : commentPage < 3 ? i : commentPage > totalPages - 3 ? totalPages - 5 + i : commentPage - 2 + i;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCommentPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${p === commentPage ? 'bg-red-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              type="button"
              disabled={commentPage === totalPages - 1}
              onClick={() => setCommentPage(commentPage + 1)}
              className="px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all text-sm font-medium"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
