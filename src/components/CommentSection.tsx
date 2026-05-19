import { useState, useEffect } from 'react';
import { Star, Reply, Trash2, Send } from 'lucide-react';
import type { ProductComment } from '../types/product';
import { useAuthStore } from '../store/useAuthStore';
import { fetchCommentsByProduct, createComment, deleteComment, checkUserCanComment } from '../services/api';

const SingleComment = ({
  comment,
  onReply,
  onDelete,
  isAdmin,
  depth = 0
}: {
  comment: ProductComment;
  onReply: (parentId: number) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
  depth?: number;
}) => {
  return (
    <div className={`mb-4 last:mb-0 ${depth > 0 ? 'ml-8 mt-4 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`font-bold text-xs uppercase ${depth > 0 ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'} w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-sm`}>
          {comment.user ? comment.user[0] : 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-xs">{comment.user}</span>
            {depth === 0 && (
              <span className="text-[9px] bg-green-100 text-green-600 px-1 py-0.5 rounded font-bold uppercase">
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400">{comment.date}</span>
        </div>

        {isAdmin && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-gray-400 hover:text-red-600 p-1 transition-colors"
            title="Xóa bình luận"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {depth === 0 && (
        <div className="flex text-yellow-400 mb-1 ml-11">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill={i < comment.stars ? "currentColor" : "none"} className={i < comment.stars ? "text-yellow-400" : "text-gray-200"} />
          ))}
        </div>
      )}

      <div className={`${depth === 0 ? 'ml-11' : ''}`}>
        <p className={`text-sm text-gray-700 leading-relaxed ${depth === 0 ? 'bg-gray-50 border border-gray-100' : 'bg-white'} p-3 rounded-2xl relative`}>
          {depth === 0 && <span className="absolute -top-2 left-4 w-4 h-4 bg-gray-50 border-l border-t border-gray-100 rotate-45"></span>}
          {comment.content}
        </p>

        <div className="mt-2 flex gap-4">
          <button
            onClick={() => onReply(comment.id)}
            className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
          >
            <Reply size={12} /> Trả lời
          </button>
        </div>
      </div>

      {/* RECURSIVE REPLIES */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map(reply => (
            <SingleComment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              isAdmin={isAdmin}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentSection = ({ productId }: { productId: number }) => {
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);

  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  const loadComments = async () => {
    setIsLoading(true);
    const data = await fetchCommentsByProduct(productId);
    setComments(data);
    setIsLoading(false);
  };

  const checkPurchased = async () => {
    if (user && isAuthenticated && !isAdmin) {
      const allowed = await checkUserCanComment(user.id, productId);
      setHasPurchased(allowed);
    }
  };

  useEffect(() => {
    if (productId) {
      loadComments();
      checkPurchased();
    }
  }, [productId, user]);

  const handleSubmit = async (parentId: number | null = null) => {
    if (!isAuthenticated || !user) {
      alert("Vui lòng đăng nhập để bình luận!");
      return;
    }
    const text = parentId ? commentText : commentText; // In reality we might use separate state for reply text
    if (!text.trim()) {
      alert("Vui lòng nhập nội dung!");
      return;
    }

    try {
      await createComment({
        content: text,
        stars: parentId ? 5 : rating,
        productId: productId,
        userId: user.id,
        parentId: parentId
      });

      setCommentText("");
      setReplyToId(null);
      if (!parentId) setRating(5);
      loadComments(); // Reload to show tree correctly
    } catch (e) {
      alert("Lỗi khi gửi bình luận.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    const success = await deleteComment(id);
    if (success) {
      loadComments();
    } else {
      alert("Xóa thất bại.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm mt-8 border border-gray-100">
      <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Hỏi đáp & Đánh giá</h2>

      {/* 1. Form gửi bình luận gốc (Chỉ cho phép nếu User đã mua SP hoặc là Admin) */}
      {(isAdmin || hasPurchased) ? (
        <div className="mb-10 border-2 border-red-50 p-6 rounded-3xl bg-red-50/20">
          <p className="font-black text-xs mb-4 text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Star size={16} className="text-red-500 fill-red-500" /> Chia sẻ trải nghiệm của bạn
          </p>

          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Bạn nghĩ gì về sản phẩm này? Hãy chia sẻ cho mọi người nhé..."
            className="w-full p-5 rounded-2xl border-2 border-white bg-white shadow-inner focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all"
            rows={3}
          />

          <div className="flex flex-col sm:flex-row justify-between mt-5 items-center gap-6">
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Đánh giá:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={`cursor-pointer transition-all hover:scale-110 ${star <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                      }`}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSubmit(null)}
              className="bg-cps text-white px-10 py-3 rounded-2xl font-black uppercase text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-100 w-full sm:w-auto active:scale-95"
            >
              Gửi đánh giá
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-10 border border-gray-200 p-6 rounded-3xl bg-gray-50 text-center">
          <p className="text-sm font-bold text-gray-600">Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này.</p>
        </div>
      )}

      {/* 2. Danh sách bình luận */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center gap-2 text-gray-300">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
            <span className="text-xs font-bold uppercase">Đang tải bình luận...</span>
          </div>
        ) : comments?.length > 0 ? (
          comments.map(c => (
            <div key={c.id}>
              <SingleComment
                comment={c}
                onReply={(id) => setReplyToId(id === replyToId ? null : id)}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />

              {/* FORM TRẢ LỜI NHANH */}
              {replyToId === c.id && (
                <div className="ml-11 mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] font-bold text-blue-500 uppercase mb-2">Đang trả lời {c.user}:</p>
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      className="flex-1 p-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập câu trả lời..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(c.id)}
                      onChange={(e) => setCommentText(e.target.value)}
                      value={commentText}
                    />
                    <button
                      onClick={() => handleSubmit(c.id)}
                      className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Star size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-sm">Chưa có bình luận nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};