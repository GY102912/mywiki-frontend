export const renderPrivateHeader = (user) => {
    const profileImage = user?.profileImageUrl ?? './assets/default-profile.png';

    return `
    <header class="page-header">
        <div class="header-inner">
            <div class="header-left">
                <button class="back-btn" id="global-back-btn"><</button>
            </div>
            <h1 class="page-title">My Wiki</h1>

            <!-- 우측 프로필 및 드롭다운 -->
            <div class="profile-menu">
                <img 
                    src="${profileImage}" 
                    class="profile-icon" 
                    id="profileToggle" 
                />

                <ul class="dropdown" id="dropdownMenu">
                    <li><a href="#" data-action="edit-profile">회원정보수정</a></li>
                    <li><a href="#" data-action="edit-password">비밀번호수정</a></li>
                    <li><a href="#" data-action="logout">로그아웃</a></li>
                </ul>
            </div>
        </div>
        <hr class="divider" />
    </header>
    `;
}
