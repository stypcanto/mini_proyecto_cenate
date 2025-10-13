package styp.com.cenate.service.account;

import styp.com.cenate.dto.*;
import java.util.List;

public interface AccountRequestService {
    AccountRequestResponse createRequest(AccountRequestCreateRequest request);
    List<AccountRequestResponse> getPendingRequests();
    UsuarioResponse approveRequest(Long id, AccountRequestReviewRequest review);
    AccountRequestResponse rejectRequest(Long id, AccountRequestReviewRequest review);
}