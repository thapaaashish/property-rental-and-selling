import { useState } from "react";
import { Share2, Mail, MessageSquare, X } from "lucide-react";
import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookMessengerShareButton,
} from "react-share";

const ShareModal = ({ isOpen, onClose, property }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/property/${property._id}`;
  const shareTitle = `${property.title} - ${property.bedrooms} bedroom, ${property.bathrooms} bath`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      onClose();
    });
  };

  const handleMessagesShare = () => {
    window.location.href = `sms:?body=Check out this property: ${property.title} - ${shareUrl}`;
    onClose();
  };

  const handleEmbed = () => {
    const embedCode = `<iframe src="${shareUrl}" width="600" height="450" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode).then(() => {
      alert("Embed code copied to clipboard!");
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 transition-opacity duration-300">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-900">Share this place</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Property Preview */}
        <div className="flex items-center mb-6 bg-gray-50 p-4 rounded-lg">
          <img
            src={property.imageUrls[0] || "/placeholder.svg"}
            alt={property.title}
            className="h-14 w-14 rounded-lg object-cover mr-4 shadow-sm"
          />
          <div>
            <p className="text-base font-semibold text-gray-800">
              {property.title}
            </p>
            <p className="text-sm text-gray-600">
              {property.bedrooms} bedroom • {property.bathrooms} bath
            </p>
          </div>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCopyLink}
            className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 shadow-sm"
          >
            <Share2 className="h-6 w-6 mr-3 text-teal-600" />
            <span className="text-gray-800 font-medium">
              {isCopied ? "Copied!" : "Copy Link"}
            </span>
          </button>
          <EmailShareButton url={shareUrl} subject={shareTitle}>
            <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 shadow-sm">
              <Mail className="h-6 w-6 mr-3 text-teal-600" />
              <span className="text-gray-800 font-medium">Email</span>
            </div>
          </EmailShareButton>
          <button
            onClick={handleMessagesShare}
            className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 shadow-sm"
          >
            <MessageSquare className="h-6 w-6 mr-3 text-teal-600" />
            <span className="text-gray-800 font-medium">Messages</span>
          </button>
          <WhatsappShareButton url={shareUrl} title={shareTitle}>
            <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 shadow-sm">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="h-6 w-6 mr-3"
              />
              <span className="text-gray-800 font-medium">WhatsApp</span>
            </div>
          </WhatsappShareButton>
          <FacebookMessengerShareButton url={shareUrl} appId="YOUR_APP_ID">
            <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 shadow-sm">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg"
                alt="Messenger"
                className="h-6 w-6 mr-3"
              />
              <span className="text-gray-800 font-medium">Messenger</span>
            </div>
          </FacebookMessengerShareButton>
          <FacebookShareButton url={shareUrl} quote={shareTitle}>
            <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 shadow-sm">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                alt="Facebook"
                className="h-6 w-6 mr-3"
              />
              <span className="text-gray-800 font-medium">Facebook</span>
            </div>
          </FacebookShareButton>
          <TwitterShareButton url={shareUrl} title={shareTitle}>
            <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 shadow-sm">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg"
                alt="Twitter"
                className="h-6 w-6 mr-3"
              />
              <span className="text-gray-800 font-medium">Twitter</span>
            </div>
          </TwitterShareButton>
          <button
            onClick={handleEmbed}
            className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 shadow-sm"
          >
            <Share2 className="h-6 w-6 mr-3 text-teal-600" />
            <span className="text-gray-800 font-medium">Embed</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
